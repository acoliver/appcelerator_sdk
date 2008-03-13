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

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletResponse;

import org.appcelerator.annotation.Downloadable;
import org.appcelerator.messaging.Message;

/**
 * an adapter which wraps an object and specific @Downloadable method which is
 * responsible for invoking the service using reflection and returning the
 * results from the invocation
 */
public class DownloadableAdapter
{
    private final Object instance;
    private final Method method;
    private Method premethod;
    private Method postmethod;
    private final Downloadable service;
    
    DownloadableAdapter(Object i, Method m, Downloadable s) throws Exception
    {
        this.instance = i;
        this.method = m;
        this.service = s;
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
    	return cl.getMethod(methodname, HttpSession.class, String.class, String.class, HttpServletResponse.class);
    }
    public boolean is(Class<? extends Object> clz, Method method, Downloadable service)
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
        if (obj instanceof DownloadableAdapter)
        {
            DownloadableAdapter sa=(DownloadableAdapter)obj;
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
     * return the downloadable annotation for the service method
     *
     * @return
     */
    public Downloadable getService ()
    {
        return this.service;
    }
    /**
     * call the service
     * 
     * @param request
     * @param response
     */
    public void dispatch (HttpSession session, String ticket, String name, HttpServletResponse response)
    {
        try
        {
        	if (premethod != null)
			{
        		premethod.invoke(this.instance,session,ticket,name,response);
			}

            this.method.invoke(this.instance,session,ticket,name,response);

        	if (postmethod != null)
			{
        		postmethod.invoke(this.instance,session,ticket,name,response);
			}
        }
        catch (Throwable e)
        {
			try { response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); } catch (Exception ex ) { } 
        }
    }
}
