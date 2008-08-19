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
        if (adapters!=null && !adapters.isEmpty())
        {
            for (ServiceAdapter adapter : adapters)
            {
                String version = adapter.getVersion();
                if (version == null || version.equals("") || version.equals(request.getVersion()))
                {
                    Message response = null;
                    boolean hasResponse = false;
                    if (adapter.getResponse() !=null)
                    {
                        response = MessageUtils.createResponseMessage(request);
                        response.setType(adapter.getResponse());
                        hasResponse = true;
                    }
                    adapter.dispatch(request, response);
                    if (hasResponse)
                    {
                        responses.add(response);
                    }
                    instance.dispatchVisitor.endVisit(token, request, responses);
                    return true;
                }
            }
        }
        instance.dispatchVisitor.endVisit(token, request, responses);
        return false;
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
