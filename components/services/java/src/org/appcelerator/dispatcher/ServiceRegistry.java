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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Service;
import org.appcelerator.annotation.Downloadable;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;

/**
 * A utility singleton class which handles registration of {@link ServiceAdapter} for
 * purposes of dispatching.
 */
public class ServiceRegistry
{
    private static final Log LOG = LogFactory.getLog(ServiceRegistry.class);
    private static final HashMap<String,Set<ServiceAdapter>> services=new HashMap<String,Set<ServiceAdapter>>();
    private static final HashMap<String,DownloadableAdapter> downloadables=new HashMap<String,DownloadableAdapter>();
    
    /**
     * given a service type, return the services
     * 
     * @param type
     * @return
     */
    public static Set<ServiceAdapter> getRegisteredServices (String type)
    {
        return services.get(type);
    }

    /**
     * given a download name, return the services
     * 
     * @param type
     * @return
     */
    public static DownloadableAdapter getRegisteredDownloadable (String name)
    {
        return downloadables.get(name);
    }
    
    /**
     * unregister a specific service
     * 
     * @param adapter
     */
    public static void unregisterService (ServiceAdapter adapter)
    {
        String type = adapter.getService().request();
        Set<ServiceAdapter> set = services.get(type);
        if (set!=null)
        {
            set.remove(adapter);
            if (set.isEmpty())
            {
                if (LOG.isDebugEnabled()) LOG.debug("unregistering service for "+type);
                services.remove(type);
            }
        }
        adapter=null;
    }
    
    public static void registerServiceMethods (Class<? extends Object> serviceClass, boolean unregisterIfFound, List<ServiceAdapter> registrations, Object instance) throws Exception
    {
        for (Method method : serviceClass.getDeclaredMethods())
        {
           Service service = method.getAnnotation(Service.class);
           if (service!=null)
           {
               instance = ServiceRegistry.registerService(service.request(),serviceClass,instance,method,service,unregisterIfFound,registrations);
           }
        }
    }

    public static void registerDownloadableMethods (Class<? extends Object> serviceClass, Object instance, boolean unregisterIfFound) throws Exception
    {
        for (Method method : serviceClass.getDeclaredMethods())
        {
           Downloadable service = method.getAnnotation(Downloadable.class);
           if (service!=null)
           {
               ServiceRegistry.registerDownloadable(service.name(),serviceClass,instance,method,service,unregisterIfFound);
           }
        }
    }

	/**
	 * register a downloadable service
	 */
	public static void registerDownloadable (String name, Class<? extends Object> clazz, Object instance, 
            Method method, Downloadable service, boolean unregisterIfFound)  throws Exception
	{
        if (LOG.isDebugEnabled()) LOG.debug("register download service for "+name+" -> "+clazz.getName()+"."+method.getName());
		
		DownloadableAdapter adapter = downloadables.get(name);
		
		if (adapter!=null)
		{
			if (unregisterIfFound)
			{
				downloadables.remove(name);
			}
			else
			{
				LOG.warn("duplicate download service detected for "+name+", class="+clazz);
				return;
			}
		}
		
		if (instance==null)
		{
			instance = clazz.newInstance();
		}
		
        adapter=new DownloadableAdapter(instance,method,service);
		downloadables.put(name,adapter);
	}

    /**
     * register a service
     * 
     * @param type
     * @param clazz
     * @param instance
     * @param method
     * @param service
     * @return
     * @throws Exception
     */
    public static Object registerService(String type, Class<? extends Object> clazz, Object instance, 
            Method method, Service service, boolean unregisterIfFound,
            List<ServiceAdapter> registrations) throws Exception
    {
        if (LOG.isDebugEnabled()) LOG.debug("register service for "+type+" -> "+clazz.getName()+"."+method.getName());
        
        Set<ServiceAdapter> adapters = services.get(type);
        if (adapters==null)
        {
            if (instance==null)
            {
                instance = clazz.newInstance();
            }
            adapters = new HashSet<ServiceAdapter>();
            ServiceAdapter adapter=new ServiceAdapter(instance,method,service);
            if (registrations!=null)
            {
                registrations.add(adapter);
            }
            adapters.add(adapter);
            services.put(type, adapters);
            return instance;
        }
        
        for (ServiceAdapter adapter : adapters)
        {
            // if found, don't re-register the same one again
            if (adapter.is(clazz, method, service))
            {
                if (unregisterIfFound)
                {
                    adapters.remove(adapter);
                    break;
                }
                return null;
            }
        }

        if (instance==null)
        {
            instance = clazz.newInstance();
        }
        ServiceAdapter adapter=new ServiceAdapter(instance,method,service);
        adapters.add(adapter);
        if (registrations!=null)
        {
            registrations.add(adapter);
        }
        return instance;
    }
    
    public static boolean dispatch (Message request, List<Message> responses)
    {
        Set<ServiceAdapter> adapters = ServiceRegistry.getRegisteredServices(request.getType());
        if (adapters!=null && !adapters.isEmpty())
        {
            for (ServiceAdapter adapter : adapters)
            {
                String version = adapter.getService().version();
                if (version == null || version.equals("") || version.equals(request.getVersion()))
                {
                    Message response = null;
                    boolean hasResponse = false;
                    if (adapter.getService().response()!=null)
                    {
                        response = MessageUtils.createResponseMessage(request);
                        response.setType(adapter.getService().response());
                        hasResponse = true;
                    }
                    adapter.dispatch(request, response);
                    if (hasResponse)
                    {
                        responses.add(response);
                    }
                    return true;
                }
            }
        }
        return false;
    }

	/**
	 * dispatch an incoming downloadable
	 */
    public static boolean dispatch (HttpSession session, String ticket, String name, HttpServletResponse response)
    {
        DownloadableAdapter adapter = ServiceRegistry.getRegisteredDownloadable(name);
		if (adapter!=null)
		{
			adapter.dispatch(session,ticket,name,response);
			return true;
		}
        return false;
    }
}
