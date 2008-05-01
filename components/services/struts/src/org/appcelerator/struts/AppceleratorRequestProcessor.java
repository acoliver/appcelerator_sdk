package org.appcelerator.struts;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.json.JSONObject;
import net.sf.json.JSONSerializer;
import net.sf.json.JsonConfig;
import net.sf.json.util.CycleDetectionStrategy;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.struts.Globals;
import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.ActionServlet;
import org.apache.struts.action.InvalidCancelException;
import org.apache.struts.action.RequestProcessor;
import org.apache.struts.config.ModuleConfig;
import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.dispatcher.ServiceDispatcherManager;
import org.appcelerator.marshaller.ServiceMarshallerManager;
import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.util.Util;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


public class AppceleratorRequestProcessor extends RequestProcessor {

    @SuppressWarnings("unused")
    private static final Log LOG = LogFactory.getLog(RequestProcessor.class);

    public void init(ActionServlet servlet, ModuleConfig moduleConfig) throws ServletException {
        super.init(servlet, moduleConfig);
        
        // ensure that the Scannotation databases have been initialized
        // before the processor runs
        AnnotationHelper.initializeAnnotationDBFromServlet(servlet.getServletContext());
    }

    /**
     * <p>Process an <code>HttpServletRequest</code> and create the
     * corresponding <code>HttpServletResponse</code> or dispatch to another
     * resource.</p>
     *
     * @param servletRequest  The servlet request we are processing
     * @param servletResponse The servlet response we are creating
     * @throws IOException      if an input/output error occurs
     * @throws ServletException if a processing exception occurs
     */
    public void process(HttpServletRequest servletRequest, HttpServletResponse servletResponse)
                                                                    throws IOException, ServletException {

        if (!servletRequest.getRequestURI().endsWith("servicebroker")) {
            super.process(servletRequest, servletResponse);
            return;
        }

        ServletOutputStream output = servletResponse.getOutputStream();
        
        
        // initial request, just accept and return
        if (servletRequest.getMethod().equals("GET")) {
            servletResponse.setHeader("Content-Length", "0");
            servletResponse.setContentType("text/plain;charset=UTF-8");
            servletResponse.setStatus(HttpServletResponse.SC_ACCEPTED);
            return;
        }
        
        // invalid method
        if (!servletRequest.getMethod().equals("POST")) {
            servletResponse.setHeader("HTTP/1.0", "405 Method Not Allowed");
            servletResponse.setHeader("Allow", "GET POST");
            output.print("Invalid method\n");
            return;
        }

        String contentType = getContentType(servletRequest);

        // decode the incoming request
        ArrayList<Message> incommingMessages = new ArrayList<Message>();
        ArrayList<Message> outgoingMessages = new ArrayList<Message>();
        
        try {
            ServiceMarshallerManager.decode(contentType, servletRequest.getInputStream(), incommingMessages);

        } catch (Exception e) {
            e.printStackTrace();
        }
        
        if (incommingMessages.isEmpty()) {
            // no incoming messages, just return accepted header
            servletResponse.setHeader("Content-Length", "0");
            servletResponse.setContentType("text/plain;charset=UTF-8");
            servletResponse.setStatus(HttpServletResponse.SC_ACCEPTED);
            return;
        }

        HttpSession session = servletRequest.getSession();
        InetAddress address = InetAddress.getByName(servletRequest.getRemoteAddr());
        String instanceid = servletRequest.getParameter("instanceid");

        // General purpose preprocessing hook
        // TODO: Check this
        if (!processPreprocess(servletRequest, servletResponse)) {
            return;
        }
        
        // Select a Locale for the current user if requested
        processLocale(servletRequest, servletResponse);
        
        this.processCachedMessages(servletRequest, servletResponse);

        for (Message incommingMessage: incommingMessages) {
            incommingMessage.setUser(servletRequest.getUserPrincipal());
            incommingMessage.setInstanceid(instanceid);
            incommingMessage.setSession(session);
            incommingMessage.setSessionid(session.getId());
            incommingMessage.setAddress(address);
            incommingMessage.setDirection(MessageDirection.INCOMING);
            
            // original appcelerator service dispatching
            try {
                ServiceDispatcherManager.dispatch(incommingMessage, outgoingMessages);
            } catch (Exception e) {
                e.printStackTrace();
            }

            String path = incommingMessage.getType();

            // Identify the mapping for this request
            ActionMapping mapping = null;
            try {
                mapping = processMapping(servletRequest, servletResponse, path);
            } catch (Exception e) {
                continue;
            }
            if (mapping == null) continue;

            // Check for any role required to perform this action
            if (!processRoles(servletRequest, servletResponse, mapping))
                continue;

            // Process any ActionForm bean related to this request
            ActionForm form = processActionForm(servletRequest, servletResponse, mapping);
            if (form == null) continue;
            
            appceleratorProcessPopulate(servletRequest, servletResponse, form, mapping, incommingMessage);

            // Validate any fields of the ActionForm bean, if applicable
            try {
                if (!processValidate(servletRequest, servletResponse, form, mapping)) {
                    continue;
                }
            } catch (InvalidCancelException e) {
                //ActionForward forward = processException(request, response, e, form, mapping);
                //processForwardConfig(request, response, forward);
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
                continue;
            } catch (ServletException e) {
                e.printStackTrace();
                continue;
            }

            // Create or acquire the Action instance to process this request
            Action action = null;
            try {
                action = processActionCreate(servletRequest, servletResponse, mapping);
            } catch (Exception e) {
                continue;
            }
            if (action == null) continue;

            // Call the Action instance itself
            ActionForward forward =
                processActionPerform(servletRequest, servletResponse, action, form, mapping);
            if (forward == null) continue;

            Message outgoingMessage = getResponseMessage(incommingMessage, form, forward, servletRequest);
            if (outgoingMessage != null)
                outgoingMessages.add(outgoingMessage);
        }

        
        // no response messages, just return accepted header
        if (outgoingMessages.isEmpty()) {
            servletResponse.setHeader("Content-Length", "0");
            servletResponse.setContentType("text/plain;charset=UTF-8");
            servletResponse.setStatus(HttpServletResponse.SC_ACCEPTED);
            return;
        }

        // setup the response
        servletResponse.setStatus(HttpServletResponse.SC_OK);
        servletResponse.setHeader("Connection", "Keep-Alive");
        servletResponse.setHeader("Pragma", "no-cache");
        servletResponse.setHeader("Cache-control", "no-cache, no-store, private, must-revalidate");
        servletResponse.setHeader("Expires", "Mon, 26 Jul 1997 05:00:00 GMT");

        // encode the responses
        ByteArrayOutputStream bout = new ByteArrayOutputStream(1000);
        
        String responseType = null;
        try {
            responseType = ServiceMarshallerManager.encode(contentType, outgoingMessages, bout);
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }

        byte buf[] = bout.toByteArray();
        ByteArrayInputStream bin = new ByteArrayInputStream(buf);
        servletResponse.setContentType(responseType);

        // do gzip encoding if browser supports it and if length > 1000
        // bytes
        String ae = servletRequest.getHeader("accept-encoding");
        if (ae != null && ae.indexOf("gzip") != -1 && buf.length > 1000) {
            servletResponse.setHeader("Content-Encoding", "gzip");
            // a Vary: Accept-Encoding HTTP response header to alert proxies
            // that a cached response should be sent only to
            // clients that send the appropriate Accept-Encoding request
            // header. This prevents compressed content from being sent
            // to a client that will not understand it.
            servletResponse.addHeader("Vary", "Accept-Encoding");
            GZIPOutputStream gzip = new GZIPOutputStream(output, buf.length);
            Util.copy(bin, gzip);
            gzip.flush();
            gzip.finish();
        } else {
            servletResponse.setContentLength(buf.length);
            Util.copy(bin, output);
        }
        output.flush();

        // Process the returned ActionForward instance
        //processForwardConfig(request, response, forward);
    }
    
    @SuppressWarnings("unchecked")
    private Message getResponseMessage(Message req, ActionForm form, ActionForward forward, HttpServletRequest request) {

        Message responseMessage = MessageUtils.createResponseMessage(req);
        responseMessage.setType(forward.getPath());

        JsonConfig jsonConfig = new JsonConfig();
        jsonConfig.setCycleDetectionStrategy(CycleDetectionStrategy.NOPROP);

        try {
            String formJSON =  JSONObject.fromObject(form, jsonConfig).toString();

            JSONObject attributesJSON = new JSONObject();
            for (Enumeration e = request.getAttributeNames(); e.hasMoreElements();) {
                String name = (String) e.nextElement();

                if (name.startsWith("org.")) { continue; }

                Object o = request.getAttribute(name);
                if (o instanceof String) {
                    attributesJSON.put(name, o);
                } else {
                    attributesJSON.put(name, JSONSerializer.toJSON(o, jsonConfig).toString());
                }

            }

            if (!formJSON.equals("null")) {
                responseMessage.getData().put("form", formJSON);
            }

            if (!attributesJSON.equals("null")) {
                responseMessage.getData().put("attributes", attributesJSON);
            }

            return responseMessage;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        
    }
    
    /**
     * Get the Content-Type from a request, accounting for inconsistencies
     * in the representation
     * @param request the request to process
     * @return the uniform Content-Type of the request
     */
    private String getContentType(HttpServletRequest request)
    {
        String type = request.getContentType();
        int idx = type.indexOf(';');
        if (idx < 0) {
            // if no specific encoding, default to UTF-8
            type = type + ";charset=UTF-8";
        } else {
            // if we have 2 ; -- trim
            idx = type.indexOf(';', idx + 1);
            if (idx > 0) {
                type = type.substring(0, idx);
            }
        }
        
        idx = type.indexOf(';');
        if (idx > 0)
        {
            type = type.substring(0,idx);
        }
        return type;
    }

    /**
     * <p>Populate the properties of the specified <code>ActionForm</code>
     * instance from the request parameters included with this request.  In
     * addition, request attribute <code>Globals.CANCEL_KEY</code> will be set
     * if the request was submitted with a button created by
     * <code>CancelTag</code>.</p>
     *
     * @param request  The servlet request we are processing
     * @param response The servlet response we are creating
     * @param form     The ActionForm instance we are populating
     * @param mapping  The ActionMapping we are using
     * @throws ServletException if thrown by RequestUtils.populate()
     */
    protected void appceleratorProcessPopulate(HttpServletRequest request,
        HttpServletResponse response, ActionForm form, ActionMapping mapping, Message message)
        throws ServletException {
        if (form == null) {
            return;
        }

        // Populate the bean properties of this ActionForm instance
        if (log.isDebugEnabled()) {
            log.debug(" Populating bean properties from this request");
        }

        form.setServlet(this.servlet);
        form.reset(mapping, request);

        if (mapping.getMultipartClass() != null) {
            request.setAttribute(Globals.MULTIPART_KEY,
                mapping.getMultipartClass());
        }

        appceleratorPopulate(form, mapping.getPrefix(), mapping.getSuffix(), message);

        // Set the cancellation request attribute if appropriate
        if ((request.getParameter(Globals.CANCEL_PROPERTY) != null)
            || (request.getParameter(Globals.CANCEL_PROPERTY_X) != null)) {
            request.setAttribute(Globals.CANCEL_KEY, Boolean.TRUE);
        }
    }
    
    /**
     * <p>Populate the properties of the specified JavaBean from the specified
     * HTTP request, based on matching each parameter name (plus an optional
     * prefix and/or suffix) against the corresponding JavaBeans "property
     * setter" methods in the bean's class. Suitable conversion is done for
     * argument types as described under <code>setProperties</code>.</p>
     *
     * <p>If you specify a non-null <code>prefix</code> and a non-null
     * <code>suffix</code>, the parameter name must match
     * <strong>both</strong> conditions for its value(s) to be used in
     * populating bean properties. If the request's content type is
     * "multipart/form-data" and the method is "POST", the
     * <code>HttpServletRequest</code> object will be wrapped in a
     * <code>MultipartRequestWrapper</code object.</p>
     *
     * @param bean    The JavaBean whose properties are to be set
     * @param prefix  The prefix (if any) to be prepend to bean property names
     *                when looking for matching parameters
     * @param suffix  The suffix (if any) to be appended to bean property
     *                names when looking for matching parameters
     * @param request The HTTP request whose parameters are to be used to
     *                populate bean properties
     * @throws ServletException if an exception is thrown while setting
     *                          property values
     */
    @SuppressWarnings("unchecked")
    public static void appceleratorPopulate(Object bean, String prefix, String suffix,
        Message message)
        throws ServletException {
        // Build a list of relevant request parameters from this request
        HashMap properties = new HashMap();

        //String contentType = request.getContentType();
        //String method = request.getMethod();

        if (bean instanceof ActionForm) {
            ((ActionForm) bean).setMultipartRequestHandler(null);
        }

        // Iterator of parameter names
        //Iterator names = request.getParameterNames();
        
        for (Iterator names = message.getData().keySet().iterator(); names.hasNext(); ) {
            String name = (String) names.next();  // Downcasting is required pre
            String stripped = name;

            if (prefix != null) {
                if (!stripped.startsWith(prefix)) {
                    continue;
                }

                stripped = stripped.substring(prefix.length());
            }

            if (suffix != null) {
                if (!stripped.endsWith(suffix)) {
                    continue;
                }

                stripped =
                    stripped.substring(0, stripped.length() - suffix.length());
            }

            Object parameterValue = null;
            try {
                parameterValue = ((JSONMessageDataObject) message.getData()).getJSONObject().get(name);
                //parameterValue = request.getParameterValues(name);
            } catch (Exception e) {
                e.printStackTrace();
                continue;
            }

            // Populate parameters, except "standard" struts attributes
            // such as 'org.apache.struts.action.CANCEL'
            if (!(stripped.startsWith("org.apache.struts."))) {
                properties.put(stripped, parameterValue);
            }
        }

        // Set the corresponding properties of our bean
        try {
            BeanUtils.populate(bean, properties);
        } catch (Exception e) {
            throw new ServletException("BeanUtils.populate", e);
        } finally {

        }
    }

}
