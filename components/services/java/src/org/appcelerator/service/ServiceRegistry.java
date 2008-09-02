
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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Downloadable;
import org.appcelerator.annotation.Service;
import org.appcelerator.locator.visitor.DispatchVisitor;
import org.appcelerator.locator.visitor.NullDispatchVisitor;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;

/**
 * A utility singleton class which handles registration of {@link MethodCallServiceAdapter} for
 * purposes of dispatching.
 */
public class ServiceRegistry
{
    private static final Log LOG = LogFactory.getLog(ServiceRegistry.class);
    private static final HashMap<String,Set<ServiceAdapter>> services = new HashMap<String,Set<ServiceAdapter>>();
    private static final HashMap<String,DownloadableAdapter> downloadables = new HashMap<String,DownloadableAdapter>();
    private static ServiceRegistry instance = new ServiceRegistry();
    private ServiceRegistry() {}
    public static ServiceRegistry getInstance() {return instance;}
    private DispatchVisitor dispatchVisitor = new NullDispatchVisitor();
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
        String type = adapter.getRequest();
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

    public static void registerServiceMethods (Class<? extends Object> serviceClass, boolean unregisterIfFound, List<ServiceAdapter> registrations, Object instance, String dispatcher) throws Exception
    {
        for (Method method : serviceClass.getDeclaredMethods())
        {
            Service serviceAnnotation = method.getAnnotation(Service.class);

            if (serviceAnnotation == null)
            {
                continue;
            }

            if (LOG.isDebugEnabled()) LOG.debug("register service for "+serviceAnnotation.request()+" -> "+serviceClass.getName()+"."+method.getName()+" with dispatcher "+dispatcher);

            if (instance == null)
            {
                instance = serviceClass.newInstance();
            }

            MethodCallServiceAdapter adapter = new MethodCallServiceAdapter(instance, method, serviceAnnotation);
            ServiceRegistry.registerService(adapter, unregisterIfFound);

            if (registrations != null)
            {
                registrations.add(adapter);
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
                ServiceRegistry.registerDownloadable(serviceClass,instance,method,service,unregisterIfFound);
            }
        }
    }

    /**
     * register a downloadable service
     */
    public static void registerDownloadable (Class<? extends Object> clazz, Object instance, 
            Method method, Downloadable service, boolean unregisterIfFound)  throws Exception
            {
        String name = service.name();

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

        adapter= new DownloadableAdapter(instance,method,service);
        downloadables.put(name,adapter);
            }

    /**
     * Register a service with the ServiceRegistry
     * @param type the type of service
     * @param adapter a ServiceAdapter which encapsulates this service
     * @param service an annotation describing this service
     * @param unregisterIfFound if a duplicate service is found, unregister the old one
     * @return true if a service is registered, false if not
     * @throws Exception
     */
    public static boolean registerService(ServiceAdapter adapter, boolean unregisterIfFound) throws Exception {

        String type = adapter.getRequest();

        Set<ServiceAdapter> adapters = services.get(type);

        if (adapters == null)
            adapters = new HashSet<ServiceAdapter>();

        // check for duplicates in the set of adapters
        for (ServiceAdapter possibleDuplicate : adapters) 
        {
            if (possibleDuplicate.is(adapter)) 
            {
                if (unregisterIfFound) {
                    adapters.remove(possibleDuplicate);
                } else {
                    return false;
                }
            }
        }

        adapters.add(adapter);
        services.put(type, adapters);

        return true;
    }

    public static boolean dispatch (Message request, List<Message> responses)
    {
        Object token = instance.dispatchVisitor.startVisit(request, responses);
        Set<ServiceAdapter> adapters = ServiceRegistry.getRegisteredServices(request.getType());

        if (adapters == null || adapters.isEmpty())
        {
            instance.dispatchVisitor.endVisit(token, request, responses);
            return false;
        }

        for (ServiceAdapter adapter : adapters)
        {
            String version = adapter.getVersion();
            if (version == null || version.equals("") || version.equals(request.getVersion()))
            {
                Message response = null;
                if (adapter.getResponse() != null)
                {
                    response = MessageUtils.createResponseMessage(request);
                    response.setType(adapter.getResponse());
                }

                adapter.dispatch(request, response);

                if (response != null)
                {
                    responses.add(response);
                }
                
            }
        }

        instance.dispatchVisitor.endVisit(token, request, responses);
        return true;

    }

    /**
     * dispatch an incoming downloadable
     */
    public static boolean dispatch (HttpServletRequest request, String ticket, String name, HttpServletResponse response)
    {
        DownloadableAdapter adapter = ServiceRegistry.getRegisteredDownloadable(name);
        if (adapter!=null)
        {
            adapter.dispatch(request,ticket,name,response);
            return true;
        }
        return false;
    }
    public DispatchVisitor getDispatchVisitor() {
        return dispatchVisitor;
    }
    public void setDispatchVisitor(DispatchVisitor dispatchVisitor) {
        this.dispatchVisitor = dispatchVisitor;
    }
}
