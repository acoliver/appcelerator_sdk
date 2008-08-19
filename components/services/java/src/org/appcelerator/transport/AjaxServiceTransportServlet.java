/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
package org.appcelerator.transport;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.annotation.ServiceTransport;
import org.appcelerator.locator.ServiceLocatorManager;
import org.appcelerator.marshaller.ServiceMarshallerManager;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageType;
import org.appcelerator.util.Util;

/**
 * {@link ServiceTransport} for handling incoming AJAX requests from the 
 * Appcelerator client.
 */
@ServiceTransport
public class AjaxServiceTransportServlet extends HttpServlet
{
    private static final Log LOG = LogFactory.getLog(AjaxServiceTransportServlet.class);
    private static final long serialVersionUID = 1L;
	private boolean embeddedMode;
	private boolean performValidation = true;
    
    /* (non-Javadoc)
     * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)
     */
    @Override
    public void init(ServletConfig config) throws ServletException
    {
        super.init(config);
        String validate = config.getInitParameter("validate");
        if (validate!=null && !validate.equals(""))
        {
        	performValidation = Boolean.parseBoolean(validate);
        }
        

        if (this.embeddedMode)
        {
            AnnotationHelper.initializeAnnotationDBFromClasspath();
        }
        else
        {
            AnnotationHelper.initializeAnnotationDBFromServlet(config.getServletContext());
        }
        
        ServiceLocatorManager.intialize(config.getServletContext());
    }
	/**
	 * called to indicate that the class path must be used when loading annotations instead
	 * of WAR lib
	 */
	public void setEmbeddedMode(boolean embed)
	{
		this.embeddedMode = embed;
	}

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        // make sure we have a session
        req.getSession();
        
        // just return empty session
        resp.setHeader("Content-Length", "0");
        resp.setContentType("text/plain;charset=UTF-8");
        resp.setStatus(HttpServletResponse.SC_ACCEPTED);
        return;
    }
    
    /**
     * perform security integrity check on the request and only accept requests that
     * correctly validate the auth token check
     * 
     * @param request
     * @param response
     * @return
     * @throws ServletException
     * @throws IOException
     */
    private boolean validate(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException
    {
    	if (!performValidation) 
    	{
    		return true;
    	}
        HttpSession session = request.getSession();
        String instanceid = request.getParameter("instanceid");
        String auth = request.getParameter("auth");
        
        boolean failed = true;
        
        if (instanceid != null && auth != null)
        {
            String check = Util.calcMD5(session.getId()+instanceid);
            failed = !check.equals(auth);
        }
        
        
        if (failed)
        {
            response.setHeader("Content-Length", "0");
            response.setContentType("text/xml;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
        
        return !failed;
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        //
        // make sure we check the integrity of the request before we continue
        //
        if (!validate(req, resp))
        {
            LOG.warn("security validation failed for request="+req+" from "+req.getRemoteAddr());
            return;
        }
        
        String type = req.getContentType();
        int idx = type.indexOf(';');

		if (idx > 0)
        {
            type = type.substring(0,idx);
        }
        
        try
        {
            // decode the incoming request
            ArrayList<Message> requests=new ArrayList<Message>(1);
            ArrayList<Message> responses=new ArrayList<Message>(1);
            
            ServiceMarshallerManager.decode(type, req.getInputStream(), requests);

            if (requests.isEmpty())
            {
                // no incoming messages, just return accepted header
                resp.setHeader("Content-Length", "0");
                resp.setContentType("text/plain;charset=UTF-8");
                resp.setStatus(HttpServletResponse.SC_ACCEPTED);
                return;
            }
            
            HttpSession session = req.getSession();
            InetAddress address = InetAddress.getByName(req.getRemoteAddr());
            //String instanceid = req.getParameter("instanceid");

            
            for (Message request : requests)
            {
                request.setUser(req.getUserPrincipal());
                request.setSession(session);
                request.setAddress(address);
                request.setServletRequest(req);
                
                //FIXME => refactor this out
                if (request.getType().equals(MessageType.APPCELERATOR_STATUS_REPORT))
                {
                    IMessageDataObject data = (IMessageDataObject)request.getData();
                    data.put("remoteaddr", req.getRemoteAddr());
                    data.put("remotehost", req.getRemoteHost());
                    data.put("remoteuser", req.getRemoteUser());
                }

                ServiceLocatorManager.dispatch(request,responses);
            }
            
            if (responses.isEmpty())
            {
                // no response messages, just return accepted header
                resp.setHeader("Content-Length", "0");
                resp.setContentType("text/plain;charset=UTF-8");
                resp.setStatus(HttpServletResponse.SC_ACCEPTED);
                return;
            }
            
            // setup the response
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setHeader("Connection", "Keep-Alive");
            resp.setHeader("Pragma", "no-cache");
            resp.setHeader("Cache-control", "no-cache, no-store, private, must-revalidate");
            resp.setHeader("Expires", "Mon, 26 Jul 1997 05:00:00 GMT");
            
            
            // encode the responses
            ServletOutputStream output = resp.getOutputStream();
            ByteArrayOutputStream bout = new ByteArrayOutputStream(1000);
            String responseType = ServiceMarshallerManager.encode(type, responses, req.getSession().getId(), bout);
            byte buf [] = bout.toByteArray();
            ByteArrayInputStream bin = new ByteArrayInputStream(buf);
            
            resp.setContentType(responseType);
            
            // do gzip encoding if browser supports it and if length > 1000 bytes
            String ae = req.getHeader("accept-encoding");
            if (ae != null && ae.indexOf("gzip") != -1 && buf.length > 1000)
            {
                resp.setHeader("Content-Encoding", "gzip");
                //a Vary: Accept-Encoding HTTP response header to alert proxies that a cached response should be sent only to 
                //clients that send the appropriate Accept-Encoding request header. This prevents compressed content from being sent 
                //to a client that will not understand it.
                resp.addHeader("Vary","Accept-Encoding");
                GZIPOutputStream gzip = new GZIPOutputStream(output,buf.length);
                Util.copy(bin, gzip);
                gzip.flush();
                gzip.finish();
            }
            else
            {
                resp.setContentLength(buf.length);
                Util.copy(bin, output);
            }
            output.flush();
        }
        catch (Throwable e)
        {
            LOG.error("Error handling incoming POST request",e);
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
