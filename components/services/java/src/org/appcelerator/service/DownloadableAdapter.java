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
