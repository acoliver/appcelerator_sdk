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
