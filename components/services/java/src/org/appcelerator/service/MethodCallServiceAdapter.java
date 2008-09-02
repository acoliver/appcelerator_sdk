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
package org.appcelerator.service;

import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Iterator;

import net.sf.json.JSONObject;

import org.appcelerator.annotation.Service;
import org.appcelerator.annotation.ServiceProperty;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;

/**
 * an adapter which wraps an object and specific @Service method which is
 * responsible for invoking the service using reflection and returning the
 * results from the invocation
 */
public class MethodCallServiceAdapter extends ServiceAdapter
{
    private final Object instance;
    private final Method method;

    @SuppressWarnings("unchecked")
    private Class serviceClass;

    private Method premethod;
    private Method postmethod;
    private Method postmethodException;

    public MethodCallServiceAdapter(Object i, Method m, Service service) throws Exception
    {
        this.instance = i;
        this.method = m;
        this.serviceClass = i.getClass();

        this.postmethod = getMethod(i,service.postmessage(), Message.class, Message.class);
        this.premethod = getMethod(i,service.premessage(), Message.class, Message.class);
        this.postmethodException = getMethod(i,service.postmessageException(), Message.class, Message.class, Throwable.class);
        this.method.setAccessible(true);

        this.request = service.request();
        this.response = service.response();
        this.version = service.version();
    }

    @SuppressWarnings("unchecked")
    public Method getMethod(Object i, String methodname, Class ... parameterTypes) throws SecurityException, NoSuchMethodException 
    {
        if (methodname==null || "".equals(methodname))
        {
            return null;
        }
        return serviceClass.getMethod(methodname, parameterTypes);
    }

    public boolean is(ServiceAdapter sa)
    {
        if (!(sa instanceof MethodCallServiceAdapter))
        {
            return false;
        }

        MethodCallServiceAdapter target = (MethodCallServiceAdapter) sa;
        if (this.method.equals(target.method) && this.instance == target.instance)
        {
            return true;
        }

        return false;
    }

    /* (non-Javadoc)
     * @see org.appcelerator.dispatcher.ServiceAdapter#equals(java.lang.Object)
     */
    public boolean equals(Object obj)
    {
        if (obj instanceof MethodCallServiceAdapter)
        {
            MethodCallServiceAdapter sa=(MethodCallServiceAdapter) obj;
            return sa.instance.equals(instance) && 
            sa.method.equals(method) &&
            super.equals(obj);
        }
        return false;
    }

    /* (non-Javadoc)
     * @see org.appcelerator.dispatcher.ServiceAdapter#hashCode()
     */
    public int hashCode()
    {
        return this.instance.hashCode() * this.method.hashCode() ^ super.hashCode();
    }

    /**
     * Return the method object for this service adapter
     * @return
     */
    public Method getMethod() 
    {
        return this.method;
    }

    @SuppressWarnings("unchecked")
    private Object getParameterFromProperty(Message request, Class clz, Annotation annotations[])
    {
        ServiceProperty prop = null;

        if (annotations!=null)
        {
            for (int c=0;c<annotations.length;c++)
            {
                if (ServiceProperty.class.equals(annotations[c].annotationType()))
                {
                    prop = (ServiceProperty)annotations[c];
                    break;
                }
            }
        }

        if (null != prop)
        {
            JSONObject obj = MessageUtils.getJSONObjectData(request);
            JSONObject value = (JSONObject)obj.get(prop.name());
            return JSONObject.toBean( value, clz );
        }
        else
        {
            return JSONObject.toBean( MessageUtils.getJSONObjectData(request), clz );
        }
    }

    /* (non-Javadoc)
     * @see org.appcelerator.dispatcher.ServiceAdapter#dispatch(org.appcelerator.messaging.Message, org.appcelerator.messaging.Message)
     */
    @SuppressWarnings("unchecked")
    public void dispatch (Message request, Message response)
    {
        try
        {
            if (premethod != null)
            {
                premethod.invoke(this.instance,request,response);
            }

            response.getData().put("success",true);

            Class types[]  = this.method.getParameterTypes();
            Annotation annotations[][] = this.method.getParameterAnnotations();
            Object returnValue = null;

            switch(types.length)
            {
                case 1:
                {
                    // first see if the parameter is a message
                    if (Message.class.equals(types[0]))
                    {
                        returnValue = this.method.invoke(this.instance, request);
                    }
                    else
                    {
                        // this must be a automapping javabean
                        returnValue = this.method.invoke(this.instance, getParameterFromProperty(request,types[0],annotations[0]));
                    }
                    break;
                }
                case 2:
                {
                    // first see if the parameters are messages
                    if (Message.class.equals(types[0]) && Message.class.equals(types[1]))
                    {
                        returnValue = this.method.invoke(this.instance, request, response);
                        break;
                    }
                }
                default:
                {
                    Object args [] = new Object[types.length];
                    for (int c=0;c<types.length;c++)
                    {
                        if (Message.class.equals(types[c]))
                        {
                            args[c] = request;
                        }
                        else
                        {
                            args[c] = getParameterFromProperty(request,types[c],annotations[c]);
                        }
                    }
                    returnValue = this.method.invoke(this.instance, args);
                }
            }

            if (postmethod != null)
            {
                postmethod.invoke(this.instance,request,response);
            }

            if (returnValue != null && false == Void.class.equals(returnValue.getClass()))
            {
                JSONObject jsonObject = JSONObject.fromObject(returnValue);
                for (Iterator iter = jsonObject.keys(); iter.hasNext();)
                {
                    String key = (String)iter.next();
                    response.getData().put(key,jsonObject.get(key));
                }
            }
        }
        catch (Throwable e)
        {
            if (postmethodException != null)
            {
            	try {
                	if (e instanceof InvocationTargetException)
                		postmethodException.invoke(this.instance,request,response, ((InvocationTargetException)e).getCause());
                	else
                		postmethodException.invoke(this.instance,request,response, e);
            	} catch (Exception fatal) {
            		throw new RuntimeException("major problem invoking poastMethod for "+ request.getType(), fatal);
            	}
            }
            else
            {
                e.printStackTrace();
                response.getData().put("success",false);
                response.getData().put("exception",e.getMessage());
            }
        }
    }
}
