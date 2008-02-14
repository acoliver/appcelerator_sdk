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
package org.appcelerator.spring;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.FutureTask;

import javax.security.auth.Subject;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.appcelerator.Constants;
import org.appcelerator.annotation.Service;
import org.appcelerator.annotation.ServiceAuthenticator;
import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.IServiceBroker;
import org.appcelerator.messaging.IServiceListener;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataObjectException;
import org.appcelerator.messaging.MessageDataType;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.router.ServiceConstants;
import org.appcelerator.spring.AnnotationUtil.IMethodVisitor;
import org.appcelerator.util.ServerID;
import org.springframework.beans.factory.BeanFactory;

/**
 * MessageHandlerVisitor handles visitation of methods that are annotated message handlers.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class ServiceVisitor implements IMethodVisitor
{
    private static final Logger LOG = Logger.getLogger(ServiceVisitor.class);

    private BeanFactory factory;
    private IServiceBroker broker;
    private ServiceAuthenticatorVisitor serviceVisitor;
    private Authenticator authenticator;
    private IMessageDataList<IMessageDataObject> services = MessageUtils.createMessageDataObjectList();

    /**
     * constructs a new message handler visitor
     *
     * @param factory bean factory
     */
    ServiceVisitor(BeanFactory factory, ServiceAuthenticatorVisitor v)
    {
        this.factory = factory;
        this.serviceVisitor = v;
    }
    
    public void endConfiguration ()
    {
        if (authenticator == null && serviceVisitor.getService()!=null)
        {
            authenticator = new Authenticator();
            broker.registerListener(new ServiceAuthListener());
        }
    }

    public void initialization () throws Exception
    {
        Message msg = new Message();
        msg.setAddress(InetAddress.getLocalHost());
        msg.setInstanceid(ServerID.getServerID());
        msg.setRequestid(String.valueOf(System.currentTimeMillis()));
        msg.setBroker(broker);
        msg.setDataType(MessageDataType.JSON);
        msg.setDirection(MessageDirection.ANY);
        msg.setSentTimestamp(System.currentTimeMillis());
        msg.setVersion("1.0");
        msg.setScope("appcelerator");
        msg.setData(MessageUtils.createMessageDataObject().put("services", services));
        msg.setType(ServiceConstants.SERVICE_REGISTRY_ADD);
        FutureTask<Void> future=new FutureTask<Void>(new Runnable(){public void run(){}},null);
        broker.dispatch(msg, future);
    }
    
    private final class Authenticator 
    {
        Object authBean = serviceVisitor.getService();
        Method authMethod = serviceVisitor.getMethod();
        ServiceAuthenticator authenticator = authBean.getClass().getAnnotation(ServiceAuthenticator.class);
        String authRequest = authenticator.request();
        String authResponse = authenticator.response();
        
        boolean isAuthenticationRequest (String type)
        {
            return type.equals(authRequest);
        }
        
        Subject authenticate (Message request, Message response) throws Exception
        {
            return (Subject)authMethod.invoke(authBean, request, response);
        }
    }
    
    

    /**
     * called when the spring bean context is destroyed.
     */
    void destroy (Object bean, String beanName) throws Exception
    {
        List<ServiceListener> listeners = serviceListeners.remove(bean);
        
        if (listeners!=null)
        {
            for (ServiceListener listener : listeners)
            {
                LOG.info("unregistered "+beanName+", service type = "+listener.type+", version = "+listener.version+" for "+bean);
                broker.unregisterListener(listener);
            }
        }
        
        /* FIXME
        Message msg = new Message();
        msg.setAddress(InetAddress.getLocalHost());
        msg.setInstanceid(ServerID.getServerID());
        msg.setRequestid(String.valueOf(System.currentTimeMillis()));
        msg.setBroker(broker);
        msg.setDataType(MessageDataType.JSON);
        msg.setDirection(MessageDirection.ANY);
        msg.setSentTimestamp(System.currentTimeMillis());
        msg.setVersion("1.0");
        msg.setScope("appcelerator");
        msg.setData(MessageUtils.createMessageDataObject().put("services", services));
        msg.setType(ServiceConstants.SERVICE_REGISTRY_REMOVE);
        FutureTask<Void> future=new FutureTask<Void>(new Runnable(){public void run(){}},null);
        broker.dispatch(msg, future);
        */
    }
    
    private final Map<Object,List<ServiceListener>> serviceListeners=new HashMap<Object,List<ServiceListener>>();

    /**
     * called to visit a method on a bean
     *
     * @param bean   bean to visit
     * @param method method to visit
     */
    public void visit(Object bean, Method method)
    {
        Service handler = method.getAnnotation(Service.class);
        String request = handler.request();
        String response = handler.response().equals("") ? null : handler.response();
        
        LOG.info("register service => "+request+", version => "+handler.version()+", secure => "+handler.authenticationRequired());

        method.setAccessible(true);

        // register our listener for this method handler
        ServiceListener listener = new ServiceListener(bean, method, handler);
        
        List<ServiceListener> listeners = serviceListeners.get(bean);
        if (listeners==null)
        {
            listeners = new ArrayList<ServiceListener>();
            serviceListeners.put(bean,listeners);
        }
        listeners.add(listener);
        
        if (broker == null)
        {
            broker = (IServiceBroker) factory.getBean("serviceBroker", IServiceBroker.class);
        }

        if (LOG.isDebugEnabled())
        {
            LOG.debug("register method handler for request:" + request + ", response:" + response + " for " + bean.getClass().getName() + "." + method.getName());
        }
        broker.registerListener(listener);
        
        try
        {
            if (!request.equals(ServiceConstants.SERVICE_REGISTRY_ADD))
            {
                IMessageDataObject data = MessageUtils.createMessageDataObject();
                data.put("type",request);
                data.put("security",handler.authenticationRequired());
                data.put("version",handler.version());
                services.add(data);
            }
        }
        catch (Exception ex)
        {
            LOG.error("error sending registration message",ex);
        }
    }

    final class ServiceAuthListener implements IServiceListener
    {
        public boolean accept(Message message)
        {
            // TODO Auto-generated method stub
            return message.getDirection().equals(MessageDirection.INCOMING);
        }

        public List<String> getServiceTypes()
        {
            ArrayList<String> types=new ArrayList<String>(1);
            types.add(authenticator.authRequest);
            return null;
        }

        public void onMessage(Message request)
        {
            Message response = MessageUtils.createResponseMessage(request);
            response.setType(authenticator.authResponse);
            IMessageDataObject responseObj = response.getData();

            try
            {
                Subject subject = authenticator.authenticate(request,response);
                
                if (subject!=null)
                {
                    response.setUser(subject);
                    responseObj.put("success",true);
                    
                    HttpSession session = request.getSession();
                    if (session!=null)
                    {
                        // set the user in the session
                        session.setAttribute(Constants.USER, subject);
                    }
                }
                else
                {
                    responseObj.put("message","authentication.required.failed");
                    responseObj.put("secondary_message","Authentication Failed.");
                    responseObj.put("success", false);
                }
            }
            catch (Exception e)
            {
                responseObj.put("message","authentication.required.error");
                responseObj.put("secondary_message","Authentication Failed Error. Message: "+e.getMessage());
                responseObj.put("success", false);
            }
            broker.dispatch(response, null);
        }
    }
    
    /**
     * MessageHandlerListener handles listening for messages for the annotated method and delegating the call to the
     * method when the message arrives.
     */
    final class ServiceListener implements IServiceListener
    {
        private final String type;
        private final Object bean;
        private final Method method;
        private final String version;
        private Method pre1Method, pre2Method;
        private Method post1Method, post2Method;
        private Method after1Method, after2Method;
        private final String responseType;
        private final boolean authenticationRequired;
        private final MessageDirection requestMessageDirection;
        private final MessageDirection responseMessageDirection;

        /**
         * constructs a new message handler listener
         *
         * @param bean    target bean
         * @param method  method to invoke on message
         * @param handler message handler annotation
         */
        ServiceListener(Object bean, Method method, Service handler) 
        {
            this.bean = bean;
            this.method = method;
            this.version = handler.version();
            this.type = handler.request();
            this.responseType = handler.response().equals("") ? null : handler.response();
            this.authenticationRequired = handler.authenticationRequired();
            this.requestMessageDirection = handler.requestDirection();
            this.responseMessageDirection = handler.responseDirection();
            
            String annotatedMethod = method.getName().substring(0,1).toUpperCase() + method.getName().substring(1);
            // look to see if we have pre and/or post invocation interceptors
            Set<Method> methods = new HashSet<Method>();
            AnnotationUtil.collectMethods(bean.getClass(), methods);
            for (Method m : methods)
            {
                String n = m.getName();
                
                if (n.equals("preMessage"))
                {
                    this.pre1Method = m;
                    this.pre1Method.setAccessible(true);
                }
                else if (n.equals("pre"+annotatedMethod))
                {
                    this.pre2Method = m;
                    this.pre2Method.setAccessible(true);
                }
                else if (n.equals("afterMessage"))
                {
                    this.pre1Method = m;
                    this.pre1Method.setAccessible(true);
                }
                else if (n.equals("after"+annotatedMethod))
                {
                    this.pre2Method = m;
                    this.pre2Method.setAccessible(true);
                }
                else if (n.equals("postMessage"))
                {
                    this.post1Method = m;
                    this.post1Method.setAccessible(true);
                }
                else if (n.equals("post"+annotatedMethod))
                {
                    this.post2Method = m;
                    this.post2Method.setAccessible(true);
                }
            }
        }

        /**
         * called to filter messages
         *
         * @param message message to determine willingness to accept
         * @return <code>true</code> to accept the message, <code>false</code> otherwise
         */
        public boolean accept(Message message)
        {
        	if (message.getDirection().equals(MessageDirection.ANY) || message.getDirection().equals(requestMessageDirection))
        	{
        	    return message.getVersion().equals(version);
        	}
        	
        	return false;
        }

        /**
         * called when a message is received by the broker
         *
         * @param message previously accepted message which is now ready for processing
         */
        public void onMessage(Message request)
        {
            long started = System.currentTimeMillis();

            Message response = null;
            IMessageDataObject responseObj = null;

            if (this.responseType != null)
            {
                response = MessageUtils.createResponseMessage(request);
                response.setType(responseType);
                response.setDataType(MessageDataType.JSON);
                response.setDirection(responseMessageDirection);
                responseObj = MessageUtils.createMessageDataObject();
                response.setData(responseObj);
            }

            //
            // do the authentication verification
            //
            if (this.authenticationRequired && request.getUser()==null)
            {
                responseObj.put("message","authentication.required");
                responseObj.put("secondary_message","Authentication Required");
                responseObj.put("success", false);
                broker.dispatch(response, null);
                return;
            }
            
            try
            {
                if (LOG.isDebugEnabled())
                {
                    LOG.debug("starting to handle: " + request);
                }

                // invoke generic pre-method interceptor if we have one
                if (this.pre1Method != null)
                {
                    this.pre1Method.invoke(bean, request, response);
                }

                // invoke specific pre-method interceptor if we have one
                if (this.pre2Method != null)
                {
                    this.pre2Method.invoke(bean, request, response);
                }

                Object returnValue = null;
                
                // invoke our method
                if (response!=null)
                {
                    returnValue = method.invoke(bean, request, response);
                }
                else
                {
                    method.invoke(bean, request);
                }
                
                if (this.after2Method != null)
                {
                    returnValue = after2Method.invoke(bean, request, response);
                }

                if (this.after1Method != null)
                {
                    returnValue = after1Method.invoke(bean, request, response);
                }

                // if the response is true or the method declares void -- and in both cases, if 
                // the response is not null, then dispatch the response event
                if (response!=null && returnValue!=Boolean.FALSE)
                {
                    try
                    {
                        responseObj.getBoolean("success");
                    }
                    catch (MessageDataObjectException squash)
                    {
                        // set success=true automatically
                        responseObj.put("success", true);
                    }
                    if (LOG.isDebugEnabled())
                    {
                        LOG.debug("finished handling: " + request + ", queued respose: " + response + ", duration: " + (System.currentTimeMillis() - started) + " ms");
                    }
                    broker.dispatch(response,null);
                }
                else
                {
                    if (LOG.isDebugEnabled())
                    {
                        LOG.debug("finished handling: " + request + ", no response to queue, duration: " + (System.currentTimeMillis() - started) + " ms");
                    }
                }
            }
            catch (Throwable ex)
            {
                LOG.error("Error dispatching message: " + request + " to " + bean, ex);
                if (response != null)
                {
                    if (ex instanceof InvocationTargetException)
                    {
                        ex = ((InvocationTargetException) ex).getTargetException();
                    }
                    responseObj.put("success", Boolean.FALSE);
                    responseObj.put("message", ex.getMessage());
                    broker.dispatch(response,null);
                }
            }
            finally
            {
                // invoke the specific post-method interceptor (if found) first
                if (this.post2Method != null)
                {
                    try
                    {
                        this.post2Method.invoke(bean);
                    }
                    catch (Throwable t)
                    {
                        LOG.error("error invoking post-message interceptor for "+bean,t);
                    }
                }
                // invoke the generic post-method interceptor (if found) last
                if (this.post1Method != null)
                {
                    try
                    {
                        this.post1Method.invoke(bean);
                    }
                    catch (Throwable t)
                    {
                        LOG.error("error invoking post-message interceptor for "+bean,t);
                    }
                }
            }
        }

        public List<String> getServiceTypes()
        {
            ArrayList<String> types = new ArrayList<String>(1);
            types.add(type);
            return types;
        }
    }
}
