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
