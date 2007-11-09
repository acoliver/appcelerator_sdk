/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
package org.appcelerator.servlet.service;

import java.io.IOException;
import java.net.InetAddress;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import javax.security.auth.Subject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.apache.log4j.Logger;
import org.appcelerator.Constants;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.IServiceBroker;
import org.appcelerator.messaging.IServiceListener;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageType;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.servlet.dispatcher.DispatchServlet;
import org.appcelerator.servlet.listener.SessionManager;
import org.appcelerator.session.ExecutableSessionManager;
import org.appcelerator.session.IExecutableSession;
import org.appcelerator.session.IExecutableSessionFactory;
import org.appcelerator.session.ISessionExecutorFactory;
import org.appcelerator.util.Util;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * MessagingServlet handles processing of incoming and outgoing messages and appropriate queuing.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class ServiceDispatcherServlet extends DispatchServlet implements IServiceListener, HttpSessionListener
{
    private static final boolean DEBUG = Boolean.getBoolean("app.messaging.debug");
    private static final long serialVersionUID = 1L;
    private static final Logger LOG = Logger.getLogger(ServiceDispatcherServlet.class);

    private final Map<String, Map<String,LinkedBlockingQueue<Message>>> queue = Collections.synchronizedMap(new HashMap<String, Map<String,LinkedBlockingQueue<Message>>>());

    @InjectBean
    private IServiceBroker serviceBroker = null;
    @InjectBean
    private ExecutableSessionManager executableSessionManager = null;
    @InjectBean
    private IExecutableSessionFactory executableSessionFactory;
    @InjectBean
    private ISessionExecutorFactory sessionExecutorFactory;
    private String sharedSecret;
    
    public void setSharedSecret(String sharedSecret)
    {
        this.sharedSecret = Util.calcMD5(sharedSecret);
    }

    
    public void setExecutableSessionFactory(IExecutableSessionFactory executableSessionFactory)
    {
        this.executableSessionFactory = executableSessionFactory;
    }

    public void setSessionExecutorFactory(ISessionExecutorFactory sessionExecutorFactory)
    {
        this.sessionExecutorFactory = sessionExecutorFactory;
    }

    /**
     * called when a message is received by the broker.  this servlet only accepts outgoing messages and will dish
     * them off appropriately when client makes request to servlet.
     *
     * @param message previously accepted message which is now ready for proceessing
     */
    public boolean accept(Message message)
    {
        return message.getDirection().equals(MessageDirection.OUTGOING);
    }

    /**
     * called when a message is received by the broker.  this servlet takes the outgoing messages and places them into
     * the appropriate queue for dispatching to the session.
     *
     * @param message previously accepted message which is now ready for processing
     */
    public void onMessage(Message message)
    {
        String id = message.getSessionid();

        if (SessionManager.getInstance().isActiveSession(id))
        {
            String instanceid = message.getInstanceid();
            Map<String,LinkedBlockingQueue<Message>> instances = createOrGetQueue(id, instanceid, false);
            LinkedBlockingQueue<Message> mq = instances.get(instanceid);
            
            if (mq!=null)
            {
                if (LOG.isDebugEnabled()) LOG.debug("session message for: " + id + ", mq=" + mq + ", message:" + message);
                mq.add(message);
            }
        }
    }

    /**
     * create the message queue for the session
     *
     * @param event http session event
     */
    public void sessionCreated(HttpSessionEvent event)
    {
        if (executableSessionFactory!=null)
        {
            String id = event.getSession().getId();
            IExecutableSession session = executableSessionFactory.createSession(id, sessionExecutorFactory.createSessionExecutor(id));
            executableSessionManager.addSession(session);
        }
    }

    /**
     * will create a new message queue if one doesn't exist
     *
     * @param id    session id of the queue
     * @param clear messages from the queue
     */
    private Map<String,LinkedBlockingQueue<Message>> createOrGetQueue(String id, String instanceid, boolean clear)
    {
        Map<String,LinkedBlockingQueue<Message>> instances;
        
        synchronized (queue)
        {
            instances = queue.get(id);
            if (instances == null)
            {
                instances = Collections.synchronizedMap(new HashMap<String,LinkedBlockingQueue<Message>>());
                queue.put(id, instances);
            }
            
            if (!instances.containsKey(instanceid))
            {
                instances.put(instanceid, new LinkedBlockingQueue<Message>());
            }
        }

        if (clear)
        {
            IExecutableSession session = executableSessionManager.getSession(id);
            if (null != session)
            {
                executableSessionManager.removeSession(session);
            }
        }

        return instances;
    }

    /**
     * destroy the queue and associated messages
     *
     * @param event http session event
     */
    public void sessionDestroyed(HttpSessionEvent event)
    {
        String id = event.getSession().getId();
        Map<String,LinkedBlockingQueue<Message>> instances = queue.remove(id);
        if (instances!=null)
        {
            for (Iterator<String> iter = instances.keySet().iterator(); iter.hasNext();)
            {
                String key = iter.next();
                LinkedBlockingQueue<Message> mq = instances.get(key);
                if (mq!=null)
                {
                    mq.clear();
                }
                iter.remove();
            }
            instances.clear();
        }

        if (LOG.isDebugEnabled()) LOG.debug("session destroyed for: " + id);

        IExecutableSession session = executableSessionManager.getSession(id);
        if (null != session)
        {
            executableSessionManager.removeSession(session);
        }
    }

    @Override
    public void destroy()
    {
        serviceBroker.unregisterListener(this);
        SessionManager.getInstance().removeSessionListener((HttpSessionListener) this);
        queue.clear();
        super.destroy();
    }

    @Override
    public void init(ServletConfig arg0) throws ServletException
    {
        super.init(arg0);
        serviceBroker.registerListener(this);
        SessionManager.getInstance().addSessionListener((HttpSessionListener) this);
    }


    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        if (request.getParameter("init")!=null)
        {
            // just return in this case
            return;
        }
        
        boolean reloaded = false;
        try
        {
            HttpSession session = request.getSession();
            String id = session.getId();
            String instanceid = request.getParameter("instanceid");
            String auth = request.getParameter("auth");
            boolean proceed = false;
            
            if (sharedSecret!=null)
            {
                if (sharedSecret.equals(auth))
                {
                    proceed=true;
                }
            }
            if (!proceed && !checkAuthToken(request, id, instanceid, auth))
            {
                LOG.warn("Request was invalid, invalid auth token match - sessionid =" + id +", instanceid = "+instanceid + ", auth = "+auth+" from " + request.getRemoteAddr() + "/" + request.getRemoteHost());
                response.setHeader("Content-Length", "0");
                response.setContentType("text/plain");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            

            // if this is the initial request, push a session reloaded attribute 
            // on the session so any listeners to the session can know that
            // this page is being reloaded (but the session is still valid)
            Object restored = request.getSession().getAttribute(Constants.SESSION_RESTORED);
            reloaded = "1".equals(request.getParameter("initial")) && restored == null && !request.getSession().isNew();

            if (reloaded)
            {
                request.getSession().setAttribute(Constants.SESSION_RELOADED, Boolean.TRUE);
            }

            // process outgoing messages
            processOutgoingMessages(id, instanceid, false, response);
        }
        catch (Exception e)
        {
            LOG.error("error processing incoming message", e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
        finally
        {
            if (reloaded)
            {
                request.getSession().removeAttribute(Constants.SESSION_RELOADED);
            }
        }
    }
    
    private boolean checkAuthToken(HttpServletRequest request, String sessionid, String instanceid, String auth)
    {
        String check = Util.calcMD5(sessionid+instanceid);
        boolean passed = check.equals(auth);
        if (!passed)
        {
            LOG.debug("check auth token failed - expected="+check+", received="+auth);
        }
        return passed;
    }

    @Override
    protected void doHead(HttpServletRequest req, HttpServletResponse response)
            throws ServletException, IOException
    {
        // indicate we have no content for them
        response.setHeader("Content-Length", "0");
        response.setContentType("text/plain");
        response.setStatus(HttpServletResponse.SC_ACCEPTED);
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-control", "no-cache, no-store, private, must-revalidate");
        response.setHeader("Expires", "Mon, 26 Jul 1997 05:00:00 GMT");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        try
        {
            if (request.getContentType() != null && "text/xml".indexOf(request.getContentType()) != -1)
            {
                LOG.warn("Request was invalid, improper content type request: " + request.getContentType() + " from " + request.getRemoteAddr() + "/" + request.getRemoteHost());
                response.setHeader("Content-Length", "0");
                response.setContentType("text/plain");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            HttpSession session = request.getSession();

            String id = session.getId();
            String instanceid = request.getParameter("instanceid");
            String auth = request.getParameter("auth");
            boolean proceed = false;
            
            if (sharedSecret!=null)
            {
                if (sharedSecret.equals(auth))
                {
                    proceed=true;
                }
            }
            if (!proceed && !checkAuthToken(request, id, instanceid, auth))
            {
                LOG.warn("Request was invalid, invalid auth token match - sessionid =" + id +", instanceid = "+instanceid + ", auth = "+auth+" from " + request.getRemoteAddr() + "/" + request.getRemoteHost());
                response.setHeader("Content-Length", "0");
                response.setContentType("text/plain");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                
                String retryCount = request.getParameter("retry");
                if (retryCount!=null)
                {
                    response.setIntHeader("X-Failed-Retry", Integer.parseInt(retryCount)+1);
                }
                
                return;
            }
            
            if (request.getContentLength() > 0)
            {
                // post should have content
                Document xml = Util.toXML(request.getInputStream());

                Subject user = (Subject) session.getAttribute(Constants.USER);

                // process incoming messages
                if (!processIncomingMessages(request, response, session, id, instanceid, user, xml))
                {
                    // return and don't process any outgoing messages in this case
                    return;
                }
            }

            
            // process outgoing messages
            processOutgoingMessages(id, instanceid, true, response);
        }
        catch (Exception e)
        {
            LOG.error("error processing incoming message", e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    /**
     * process any outgoing messages for this session
     *
     * @param id                 session id
     * @param hasIncomingRequest <code>true</code> if incoming request was associated with this request to the servlet
     * @param maxwaitTime        time to wait in ms for outgoing messages
     * @param response           http servlet response
     * @throws Exception upon processing error
     */
    protected void processOutgoingMessages(String id, String instanceId, boolean hasIncomingRequest, HttpServletResponse response) throws Exception
    {
        if (LOG.isDebugEnabled())
        {
            LOG.debug("processOutgoingMessages - id=" + id + ", instanceid="+instanceId+", hasIncomingRequest=" + hasIncomingRequest);
        }
        Document xml = MessageUtils.createMessageXML(id,instanceId);
        Element root = xml.getDocumentElement();

        int count = 0;
        Map<String,LinkedBlockingQueue<Message>> instances = queue.get(id);
        if (instances!=null)
        {
            LinkedBlockingQueue<Message> mq = instances.get(instanceId);
            
            if (null != mq)
            {
                try
                {
                    // if we have data, go and head pull as long as we have data
                    while (true)
                    {
                        Message message = mq.poll(0, TimeUnit.MILLISECONDS);
                        if (message == null)
                        {
                            break;
                        }
                        // add it
                        MessageUtils.toXML(message, root);
                        count++;
                    }
                }
                catch (InterruptedException ex)
                {
                    LOG.warn("Thread: " + Thread.currentThread() + " was interrupted", ex);
                }
            }
        }
        if (count > 0)
        {
            response.setContentType("text/xml");
            response.setStatus(HttpServletResponse.SC_OK);
            response.setHeader("Connection", "Keep-Alive");

            if (DEBUG && LOG.isDebugEnabled())
            {
                LOG.debug(Util.serialize(xml));
            }

            // now serialize the XML to the servlet's output stream
            Util.serialize(xml, response.getWriter());
        }
        else
        {
            // indicate we have no content for them
            response.setHeader("Content-Length", "0");
            response.setContentType("text/plain");
            response.setStatus(HttpServletResponse.SC_ACCEPTED);
        }
        
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-control", "no-cache, no-store, private, must-revalidate");
        response.setHeader("Expires", "Mon, 26 Jul 1997 05:00:00 GMT");
    }

    /**
     * process incoming messages from a post payload
     *
     * @param request   http servlet request
     * @param response  http servlet response
     * @param session   http session
     * @param sessionid session id
     * @param user      user
     * @param xml       message payload
     * @return <code>true</code> to continue message processing, <code>false</code> to indicate processing must stop
     * @throws Exception upon processing error
     */
    protected boolean processIncomingMessages(HttpServletRequest request, HttpServletResponse response, HttpSession session, String sessionid, String instanceid, Subject user, Document xml) throws Exception
    {
        Element root = xml.getDocumentElement();
        
        InetAddress address = InetAddress.getByName(request.getRemoteAddr());
        long timestamp = Long.parseLong(root.getAttribute("timestamp"));
        float tz = Float.parseFloat(root.getAttribute("tz"));
        
        NodeList nodes = root.getChildNodes();
        if (nodes != null)
        {
            int len = nodes.getLength();
            if (len > 0)
            {
                for (int c = 0; c < len; c++)
                {
                    Node node = nodes.item(c);
                    if (node.getNodeType() == Node.ELEMENT_NODE)
                    {
                        Element elem = (Element) node;

                        // construct our message object from XML
                        final Message preMessage = MessageUtils.fromXML(elem, user);
                        if (preMessage.getType() == null)
                        {
                            LOG.warn("Invalid message. No messagetype found or invalid. Incoming XML: " + Util.serialize(xml) + ", incoming type:" + elem.getAttribute("type"));
                            continue;
                        }

                        preMessage.setSession(session);
                        preMessage.setSessionid(sessionid);
                        preMessage.setInstanceid(instanceid);
                        preMessage.setDirection(MessageDirection.INCOMING);
                        preMessage.setTimezoneOffset(tz);
                        preMessage.setSentTimestamp(timestamp);
                        preMessage.setAddress(address);

                        final Message message = interceptMessage(preMessage);
                        
                        //TODO: REFACTOR THIS OUT
                        if (message.getType().equals(MessageType.APPCELERATOR_STATUS_REPORT))
                        {
                            IMessageDataObject data = (IMessageDataObject)message.getData();
                            data.put("remoteaddr", request.getRemoteAddr());
                            data.put("remotehost", request.getRemoteHost());
                            data.put("remoteuser", request.getRemoteUser());
                        }
                                                
                        // invoke and wait
                        FutureTask<Void> future = new FutureTask<Void>(NullRunnable.INSTANCE,null);
                        serviceBroker.dispatch(message,future);
                        future.get();
                    }
                }
            }
        }
        return true;
    }
    private static final class NullRunnable implements Runnable
    {
        private static final NullRunnable INSTANCE = new NullRunnable();
        public void run () { } 
    }

    /**
     * allow interception of the message, return null to stop further processing of the message or a
     * message to be queued in the message broker
     *
     * @param message incoming message
     * @return <code>message</code> to allow message to continue processing, <code>null</code> to intercept and stop further processing.
     */
    protected Message interceptMessage(Message message)
    {
        return message;
    }

    public List<String> getServiceTypes()
    {
        // we want all messages
        return null;
    }

}
