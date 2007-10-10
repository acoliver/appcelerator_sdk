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
package org.appcelerator.servlet.rest;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.regex.Pattern;

import javax.security.auth.Subject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.appcelerator.Constants;
import org.appcelerator.annotation.Service;
import org.appcelerator.json.JSONArray;
import org.appcelerator.json.JSONException;
import org.appcelerator.json.JSONObject;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.servlet.dispatcher.DispatchServlet;
import org.appcelerator.util.Util;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.ListableBeanFactory;

/**
 * RESTServlet is a servlet that makes Seam(less) services RESTful.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class RESTServlet extends DispatchServlet
{
    private static final long serialVersionUID = 1L;
    private static final Logger LOG = Logger.getLogger(RESTServlet.class);
    
    private ListableBeanFactory factory;
    private HashMap<String,ServiceEntry> services = new HashMap<String,ServiceEntry>();
    

    private final class ServiceEntry
    {
        private final Object instance;
        private final Method method;
        private final Service messageHandler;
        
        ServiceEntry (Object obj, Method m, Service mh)
        {
            this.instance = obj;
            this.method = m;
            this.messageHandler = mh;
            // if not public, make it accesssible
            if ((this.method.getModifiers() & Modifier.PUBLIC) == 0)
            {
                this.method.setAccessible(true);
            }
        }
        
        void invoke (Message message, IMessageDataObject req, IMessageDataObject resp) throws Exception
        {
            // invoke the service method
            method.invoke(instance, new Object[]{message,req,resp});
        }
    }

    @Override
    public void init(ServletConfig config) throws ServletException
    {
        super.init(config);
        this.factory = (ListableBeanFactory) config.getServletContext().getAttribute(Constants.BEAN_FACTORY);
        
        // discover services
        discoverServices();
    }
    
    /**
     * method will find all beans that are message handlers
     */
    private void discoverServices ()
    {
        for (String alias : this.factory.getBeanDefinitionNames())
        {
            Object bean = this.factory.getBean(alias);
            Class<? extends Object> clazz = bean.getClass();
            String name = clazz.getSimpleName();
            Method methods[] = clazz.getDeclaredMethods();
            for (Method method : methods)
            {
                if (method.isAnnotationPresent(Service.class))
                {
                    Service messageHandler = method.getAnnotation(Service.class);
                    ServiceEntry service = new ServiceEntry(bean,method,messageHandler);
                    // register by <classname>/<methodname>
                    services.put(name+"/"+method.getName(), service);
                    LOG.info("registering REST service at: "+name+"/"+method.getName());
                    // register by <classname>/<request>
                    services.put(name+"/"+messageHandler.request(),service);
                    LOG.info("registering REST service at: "+name+"/"+messageHandler.request());
                    // register by <beanName>/<methodname>
                    services.put(alias+"/"+method.getName(), service);
                    LOG.info("registering REST service at: "+alias+"/"+method.getName());
                    // register by <beanName>/<request>
                    services.put(alias+"/"+messageHandler.request(),service);
                    LOG.info("registering REST service at: "+alias+"/"+messageHandler.request());
                }
            }
        }
    }
    
    private static final Pattern NUMBER_PATTERN=Pattern.compile("[-]{0,1}[0-9]+");
    private static final Pattern FLOAT_PATTERN=Pattern.compile("[0-9]*\\.[0-9]+[f]{0,1}");
    
    public static void main (String args[]) throws Exception
    {
        System.err.println(((JSONArray)convertJSONDataType("[1,2,3]")).get(0));
    }
    
    /**
     * convert to a json data type
     */
    private static Object convertJSONDataType (String value)
    {
        if (value.equals("null"))
        {
            return null;
        }
        else if (value.equals("true"))
        {
            return Boolean.TRUE;
        }
        else if (value.equals("false"))
        {
            return Boolean.FALSE;
        }
        else if (FLOAT_PATTERN.matcher(value).matches())
        {
            return Float.parseFloat(value);
        }
        else if (NUMBER_PATTERN.matcher(value).matches())
        {
            return Integer.parseInt(value);
        }
        else if (value.startsWith("[") && value.endsWith("]"))
        {
            // array type
            try
            {
                return new JSONArray(value);
            }
            catch (JSONException ex)
            {
            }
        }
        return value;
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        LOG.debug("servlet path = "+request.getServletPath());
        
        String path = request.getPathInfo();
        if (path==null)
        {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        
        if (LOG.isDebugEnabled())
        {
            LOG.debug("incoming REST => "+path);
        }
        
        int idx = path.substring(1).indexOf("/");
        if (idx < 0)
        {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        
        String tokens[] = path.substring(1).substring(idx+1).split("/");

        // attempt to get the session, but don't create one if we don't have one
        HttpSession session = request.getSession(false);
        
        if (tokens.length < 2)
        {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
       
        // FORMAT is:
        //
        // /<serviceName>/<methodName>[/<parameter_key>/<parameter_value>/...]
        
        String serviceName = tokens[0];
        String serviceMethod = tokens[1];
        
        try
        {
            // look up the service
            ServiceEntry service = services.get(serviceName+"/"+serviceMethod);
            
            // if not found, return 404
            if (service == null)
            {
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            
            Subject user = (session!=null) ? (Subject)session.getAttribute(Constants.USER) : null;
            
            if (service.messageHandler.authenticationRequired())
            {
                if (session == null || user==null)
                {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            }
            
            String type = service.messageHandler.request();
            
            Message message = new Message(user);
            message.setDirection(MessageDirection.INCOMING);
            message.setType(type);
            message.setSession(session);
            
            IMessageDataObject requestData = MessageUtils.createMessageDataObject();
            IMessageDataObject responseData = MessageUtils.createMessageDataObject();

            // support passing in JSON as body of POST
            if (request.getContentLength() > 0)
            {
                InputStream in = request.getInputStream();
                String json = Util.copyToString(in);
                requestData = new JSONMessageDataObject(new JSONObject(json));
            }

            if (tokens.length > 2)
            {
                // set the data
                for (int c=2;c<tokens.length;c+=2)
                {
                    String key = URLDecoder.decode(tokens[c],"UTF-8");
                    Object value = (c + 1 < tokens.length) ? tokens[c+1] : null;
                    if (value!=null)
                    {
                        // attempt conversion of json data types
                        value = convertJSONDataType(URLDecoder.decode(value.toString(),"UTF-8"));
                    }
                    requestData.put(key, value);
                }
            }
            
            if (LOG.isDebugEnabled())
            {
                LOG.debug("incoming REST => serviceName="+serviceName+", serviceMethod="+serviceMethod+", parameters: "+requestData.toDataString());
            }

            // invoke the service
            service.invoke(message, requestData, responseData);
            
            // set the response
            String responseType = service.messageHandler.response();
            if (responseType!=null)
            {
                // return the JSON response object
                response.setContentType("text/javascript");
                response.setHeader("X-Seamless-Response-Type",responseType);
                response.getWriter().print(responseData.toDataString());
            }
        }
        catch (BeansException be)
        {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        catch (NoSuchMethodException me)
        {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        catch (Exception ex)
        {
            LOG.error("error executing REST: "+path,ex);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
