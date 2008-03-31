/**
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.appcelerator.dispatcher;

import java.lang.reflect.Method;

import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;

/**
 * an adapter which wraps an object and specific @Service method which is
 * responsible for invoking the service using reflection and returning the
 * results from the invocation
 */
public class ServiceAdapter
{
    private final Object instance;
    private final Method method;
    private Method premethod;
    private Method postmethod;
    private final Service service;
    private String dispatcher;
    ServiceAdapter(Object i, Method m, Service s, String dispatcher) throws Exception
    {
        this.instance = i;
        this.method = m;
        this.service = s;
        this.dispatcher = dispatcher;
        this.postmethod = getMethod(i,s.postmessage());
        this.premethod = getMethod(i,s.premessage());
        this.method.setAccessible(true);
    }
    public static Method getMethod(Object i, String methodname) throws SecurityException, NoSuchMethodException 
	{
    	if (methodname==null || "".equals(methodname))
		{
    		return null;
		}
    	Class cl = i.getClass();
    	return cl.getMethod(methodname, Message.class, Message.class);
    }
    public boolean is(Class<? extends Object> clz, Method method, Service service)
    {
        if (this.instance.getClass().equals(clz))
        {
            if (method.equals(this.method))
            {
                return this.service.annotationType().equals(service.annotationType());
            }
        }
        return false;
    }
    public boolean equals(Object obj)
    {
        if (obj instanceof ServiceAdapter)
        {
            ServiceAdapter sa=(ServiceAdapter)obj;
            return sa.instance.equals(instance) && 
                   sa.method.equals(method) &&
                   sa.service.equals(service);
        }
        return false;
    }
    public int hashCode()
    {
        return this.instance.hashCode() * this.method.hashCode() ^ service.hashCode();
    }
    /**
     * return the service annotation for the service method
     * @return
     */
    public Service getService ()
    {
        return this.service;
    }
    /**
     * call the service
     * 
     * @param request
     * @param response
     */
    public void dispatch (Message request, Message response)
    {
        try
        {
        	if (premethod != null)
			{
        		premethod.invoke(this.instance,request,response);
			}
            response.getData().put("success",true);
            switch(this.method.getParameterTypes().length)
            {
                case 1:
                {
                    this.method.invoke(this.instance, request);
                    break;
                }
                case 2:
                {
                    this.method.invoke(this.instance, request, response);
                    break;
                }
                default:
                {
                    throw new Exception("invalid service signature");
                }
            }
        	if (postmethod != null)
			{
        		postmethod.invoke(this.instance,request,response);
			}
        }
        catch (Exception e)
        {
            response.getData().put("success",false);
            response.getData().put("exception",e.getMessage());
        }
    }
    public String toString() {
    	return "ServiceAdapter[type="+service.request()+",dispatcher="+dispatcher+"]";
    }
}
