
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

package org.appcelerator.service;

import java.lang.reflect.Method;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.appcelerator.annotation.Downloadable;

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
    
    @SuppressWarnings("unchecked")
    public static Method getMethod(Object i, String methodname) throws SecurityException, NoSuchMethodException 
	{
    	if (methodname==null || "".equals(methodname))
		{
    		return null;
		}
    	Class cl = i.getClass();
    	return cl.getMethod(methodname, HttpServletRequest.class, String.class, String.class, HttpServletResponse.class);
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
    public void dispatch (HttpServletRequest request, String ticket, String name, HttpServletResponse response)
    {
        try
        {
        	if (premethod != null)
			{
        		premethod.invoke(this.instance,request,ticket,name,response);
			}

            this.method.invoke(this.instance,request,ticket,name,response);

        	if (postmethod != null)
			{
        		postmethod.invoke(this.instance,request,ticket,name,response);
			}
        }
        catch (Throwable e)
        {
			try { response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); } catch (Exception ex ) { } 
        }
    }
}
