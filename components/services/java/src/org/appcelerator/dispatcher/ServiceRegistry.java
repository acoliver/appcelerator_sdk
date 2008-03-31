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

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Downloadable;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;

/**
 * A utility singleton class which handles registration of {@link ServiceAdapter} for
 * purposes of dispatching.
 */
public class ServiceRegistry
{
    private static final Log LOG = LogFactory.getLog(ServiceRegistry.class);
    private final HashMap<String,Set<ServiceAdapter>> services=new HashMap<String,Set<ServiceAdapter>>();
    private final HashMap<String,DownloadableAdapter> downloadables=new HashMap<String,DownloadableAdapter>();
    private DispatchVisitor dispatchVisitor = new NullDispatchVisitor();

    private static ServiceRegistry instance = new ServiceRegistry();
    public static ServiceRegistry getInstance() {return instance;}
    /**
     * given a service type, return the services
     * 
     * @param type
     * @return
     */
    public Set<ServiceAdapter> getRegisteredServices (String type)
    {
        return services.get(type);
    }

    /**
     * given a download name, return the services
     * 
     * @param type
     * @return
     */
    public DownloadableAdapter getRegisteredDownloadable (String name)
    {
        return downloadables.get(name);
    }
    
    /**
     * unregister a specific service
     * 
     * @param adapter
     */
    public void unregisterService (ServiceAdapter adapter)
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
    
    public void registerServiceMethods (Class<? extends Object> serviceClass, boolean unregisterIfFound, List<ServiceAdapter> registrations, Object instance, String dispatcher) throws Exception
    {
        for (Method method : serviceClass.getDeclaredMethods())
        {
           Service service = method.getAnnotation(Service.class);
           if (service!=null)
           {
               instance = registerService(service.request(),serviceClass,instance,method,service,unregisterIfFound,registrations,dispatcher);
           }
        }
    }

    public void registerDownloadableMethods (Class<? extends Object> serviceClass, Object instance, boolean unregisterIfFound) throws Exception
    {
        for (Method method : serviceClass.getDeclaredMethods())
        {
           Downloadable service = method.getAnnotation(Downloadable.class);
           if (service!=null)
           {
               registerDownloadable(service.name(),serviceClass,instance,method,service,unregisterIfFound);
           }
        }
    }

	/**
	 * register a downloadable service
	 */
	public void registerDownloadable (String name, Class<? extends Object> clazz, Object instance, 
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
    public Object registerService(String type, Class<? extends Object> clazz, Object instance, 
            Method method, Service service, boolean unregisterIfFound,
            List<ServiceAdapter> registrations, String dispatcher) throws Exception
    {
        LOG.debug("attemping to register service for "+type+" -> "+clazz.getName()+"."+method.getName()+" with dispatcher "+dispatcher);
        
        Set<ServiceAdapter> adapters = services.get(type);
        if (adapters==null)
        {
            if (instance==null)
            {
                instance = clazz.newInstance();
            }
            adapters = new HashSet<ServiceAdapter>();
            ServiceAdapter adapter=new ServiceAdapter(instance,method,service,dispatcher);
            if (registrations!=null)
            {
                registrations.add(adapter);
            }
            adapters.add(adapter);
            services.put(type, adapters);
            LOG.debug("added new service for "+type+" -> "+clazz.getName()+"."+method.getName()+" with dispatcher "+dispatcher);
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
                    LOG.debug("removing existing service for "+type+" -> "+adapter);
                    break;
                }
                return null;
            }
        }

        if (instance==null)
        {
            instance = clazz.newInstance();
        }
        ServiceAdapter adapter=new ServiceAdapter(instance,method,service, dispatcher);
        LOG.debug("adding service for "+type+" -> "+adapter);
        adapters.add(adapter);
        if (registrations!=null)
        {
            registrations.add(adapter);
        }
        return instance;
    }
    
    public boolean dispatch (Message request, List<Message> responses)
    {
    	Object token = this.dispatchVisitor.startVisit(request, responses);
        Set<ServiceAdapter> adapters = getRegisteredServices(request.getType());
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
                    if (LOG.isDebugEnabled()) LOG.debug("dispatching to "+adapter);
                    adapter.dispatch(request, response);
                    if (hasResponse)
                    {
                        responses.add(response);
                    }
                    this.dispatchVisitor.endVisit(token, request, responses);
                    return true;
                }
            }
        }
        this.dispatchVisitor.endVisit(token, request, responses);
        return false;
    }

	/**
	 * dispatch an incoming downloadable
	 */
    public boolean dispatch (HttpSession session, String ticket, String name, HttpServletResponse response)
    {
        DownloadableAdapter adapter = getRegisteredDownloadable(name);
		if (adapter!=null)
		{
			adapter.dispatch(session,ticket,name,response);
			return true;
		}
        return false;
    }
	public DispatchVisitor getDispatchVisitor() {
		return dispatchVisitor;
	}

	public void setDispatchVisitor(DispatchVisitor dispatchVisitor) {
    	LOG.debug("setting dispatchVisitor="+dispatchVisitor);
		this.dispatchVisitor = dispatchVisitor;
	}

}
