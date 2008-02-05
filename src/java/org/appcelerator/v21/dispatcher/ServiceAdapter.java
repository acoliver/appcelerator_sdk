/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
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
package org.appcelerator.v21.dispatcher;

import java.lang.reflect.Method;

import org.appcelerator.messaging.Message;
import org.appcelerator.v21.annotation.Service;

/**
 * an adapter which wraps an object and specific @Service method which is
 * responsible for invoking the service using reflection and returning the
 * results from the invocation
 */
public class ServiceAdapter
{
    private final Object instance;
    private final Method method;
    private final Service service;
    
    ServiceAdapter(Object i, Method m, Service s) throws Exception
    {
        this.instance = i;
        this.method = m;
        this.service = s;
    }
    public boolean is(Class<? extends Object> clz, Method method, Service service)
    {
        if (this.instance.getClass().equals(clz))
        {
            if (method.equals(this.method))
            {
                return this.service.equals(service);
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
                   service.equals(service);
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
            }
        }
        catch (Exception e)
        {
            response.getData().put("success",false);
            response.getData().put("exception",e.getMessage());
        }
    }
}
