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
public class MethodCallServiceAdapter extends ServiceAdapter
{
    private final Object instance;
    private final Method method;
    private Class serviceClass;

    private Method premethod;
    private Method postmethod;

    public MethodCallServiceAdapter(Object i, Method m, Service service) throws Exception
    {
        this.instance = i;
        this.method = m;
        this.serviceClass = i.getClass();

        this.postmethod = getMethod(i,service.postmessage());
        this.premethod = getMethod(i,service.premessage());
        this.method.setAccessible(true);

        this.request = service.request();
        this.response = service.response();
        this.version = service.version();

    }
    public Method getMethod(Object i, String methodname) throws SecurityException, NoSuchMethodException 
    {
        if (methodname==null || "".equals(methodname))
        {
            return null;
        }
        return serviceClass.getMethod(methodname, Message.class, Message.class);
    }

    public boolean is(ServiceAdapter sa)
    {
        if (!(sa instanceof MethodCallServiceAdapter))
            return false;

        MethodCallServiceAdapter target = (MethodCallServiceAdapter) sa;
        if (this.method.equals(target.method))
            return true;

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
    public Method getMethod() {
        return this.method;
    }

    /* (non-Javadoc)
     * @see org.appcelerator.dispatcher.ServiceAdapter#dispatch(org.appcelerator.messaging.Message, org.appcelerator.messaging.Message)
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
}
