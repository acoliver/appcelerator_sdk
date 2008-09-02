
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

package org.appcelerator.locator;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletContext;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.annotation.ServiceLocator;
import org.appcelerator.messaging.Message;
import org.appcelerator.service.ServiceRegistry;

public class ServiceLocatorManager
{
    private static final Log LOG = LogFactory.getLog(ServiceLocatorManager.class);
    
    private static final List<Locator> locators = new ArrayList<Locator>();
    static boolean initalized = false;
    static ServletContext servletContext = null;

    public static final void intialize(ServletContext sc)
    {
        if (initalized)
            return;

        servletContext = sc;
        Class<? extends Object>[] locators = AnnotationHelper.findAnnotation(ServiceLocator.class); 
        intialize(locators);
    }

    public static final void intialize()
    {
        if (initalized)
            return;

        Class<? extends Object>[] locators = AnnotationHelper.findAnnotation(ServiceLocator.class); 
        intialize(locators);
    }
    
    public static final void intialize(Class<? extends Object>[] locators)
    {
        initalized = true;

        for (Class<? extends Object> locator : locators)
        {

            try
            {
                Method m = locator.getMethod("createLocator");
                Locator instance = (Locator) m.invoke(null);

                if (!Arrays.asList(locator.getInterfaces()).contains(Locator.class)) {
                    if (LOG.isDebugEnabled()) LOG.debug("tried creating locator (" + locator.getName() + ") but it did not implement Locator");
                    continue;
                }
                if (instance == null)
                    continue;

                if (LOG.isDebugEnabled()) LOG.debug("adding services from locator => " + instance);
                instance.initialize(ServiceLocatorManager.servletContext);
                ServiceLocatorManager.locators.add(instance);

            }
            catch (Exception e)
            {
                LOG.error("Error loading Locator => "+ locator.getName(), e);
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
    	return ServiceRegistry.dispatch(request, responses);
    }
}
