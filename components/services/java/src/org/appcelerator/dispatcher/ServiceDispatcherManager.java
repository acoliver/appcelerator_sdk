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
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.annotation.ServiceDispatcher;
import org.appcelerator.messaging.Message;

public class ServiceDispatcherManager
{
    private static final Log LOG = LogFactory.getLog(ServiceDispatcherManager.class);
    
    private static final List<ServiceDispatcherAdapter> dispatchers = new ArrayList<ServiceDispatcherAdapter>();
    
    static boolean initalized = false;
    public static final void intialize()
	{
    	if (initalized)
    		return;
    	Class<? extends Object>[] dispatchers =AnnotationHelper.findAnnotation(ServiceDispatcher.class); 
    	intialize(dispatchers);
	}
    public static final void intialize(Class<? extends Object>[] dispatchersin)
	{
    	if (initalized)
    		return;
    	initalized = true;
        for (Class<? extends Object> dispatcher : dispatchersin)
        {
            for (Method method : dispatcher.getMethods())
            {
                if (method.isAnnotationPresent(ServiceDispatcher.class))
                {
                    try
                    {
                        Method m = dispatcher.getMethod("createDispatcher");
                        Object instance = m.invoke(null);
                        if (instance!=null)
                        {
            	            if (LOG.isDebugEnabled()) LOG.debug("adding services for dispatcher => "+instance);
                            dispatchers.add(new ServiceDispatcherAdapter(instance,method));
                        }
                    }
                    catch (ClassNotFoundException cnf)
                    {
                        LOG.info("ServiceDispatcher => "+dispatcher.getName()+" will not be used because a third-party library is required and not available.");
                    }
                    catch (Exception e)
                    {
                        LOG.error("Error loading ServiceDispatcher => "+dispatcher.getName(),e);
                    }
                }
            }
        }
    }
    
    private static final class ServiceDispatcherAdapter
    {
        private final Object instance;
        private final Method method;

        ServiceDispatcherAdapter(Object instance, Method method) throws Exception
        {
            this.instance = instance;
            this.method = method;
            this.method.setAccessible(true);
            Method init = instance.getClass().getMethod("initialize");
            if (init!=null)
            {
                init.setAccessible(true);
                // invoker the initialize method
                init.invoke(this.instance);
            }
        }
    }
    
    /**
     * dispatch a message request to @ServiceDispatcher and return true if handled or false
     * if not handled
     * 
     * @param request
     * @param responses
     * @return
     * @throws Exception
     */
    public static boolean dispatch (Message request, List<Message> responses) throws Exception
    {
    	intialize();
    	return ServiceRegistry.getInstance().dispatch(request, responses);
    }
}
