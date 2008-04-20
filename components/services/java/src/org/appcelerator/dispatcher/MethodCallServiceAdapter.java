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
import java.lang.annotation.Annotation;
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
		{
            return false;
		}

        MethodCallServiceAdapter target = (MethodCallServiceAdapter) sa;
        if (this.method.equals(target.method))
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
        catch (Exception e)
        {
			e.printStackTrace();
            response.getData().put("success",false);
            response.getData().put("exception",e.getMessage());
        }
    }
}
