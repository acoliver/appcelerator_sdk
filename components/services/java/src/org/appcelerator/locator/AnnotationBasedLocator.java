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
import org.appcelerator.annotation.Downloadable;
import org.appcelerator.annotation.Service;
import org.appcelerator.annotation.ServiceLocator;
import org.appcelerator.service.MethodCallServiceAdapter;
import org.appcelerator.service.ServiceRegistry;


/**
 * Utility class which will auto-register all @Service method implementations in the 
 * JVM classpath. It will also associate annotated methods with their corresponding
 * Spring beans.
 */
@ServiceLocator
public class AnnotationBasedLocator implements Locator
{
    private static final Log LOG = LogFactory.getLog(AnnotationBasedLocator.class);
    protected List <Class<? extends Object>> candidateServices;
    protected ServletContext servletContext = null;

    /**
     * called by dispatcher manager to create an instance of this dispatcher
     * 
     * @return
     */
    public static Object createLocator() {
        return new AnnotationBasedLocator();
    }

    /* (non-Javadoc)
     * @see org.appcelerator.dispatcher.Locator#initialize(javax.servlet.ServletContext)
     */
    public void initialize(ServletContext sc) {
        this.candidateServices = Arrays.asList(AnnotationHelper.findAnnotation(Service.class));
        
        this.servletContext = sc;
        
        /* 
         * initialize Spring services first, so that they can be associated with their respective beans.
         */
        initializeSpringServices();
        
        /*
         * Now initialize non-Spring services
         */
        initializeServices();
    }


    private void initializeServices() {
        for (Class<?> service : this.candidateServices) {
            Object instance = null;
            for (Method method : service.getDeclaredMethods()) {
                instance = registerServiceMethod(method, service, instance);
                instance = registerDownloadableMethod(method, service, instance);
            }
        }
    }


    private void initializeSpringServices() {

        // don't register any Spring services if we are not running in Servlet
        if (servletContext == null)
            return;

        // detect if we are running a Spring container, if not -- quit early, as this
        // following code will throw a ClassNotFound exception (bad news bears!)
        if (servletContext.getAttribute("org.springframework.web.context.WebApplicationContext.ROOT") == null) {
            return;
        }
        

        /*
         * Wrap this in an inner class to hide Spring dependencies
         */
        class SpringHelper {
            public List<Class<? extends Object>> execute() {
                /*
                 * Now we need to find all classes that contain methods that are annotated with @Service
                 * and correlate them with Spring managed beans. Both types of Services (Spring and non-spring)
                 * needs to be created only once, so from the list of @Service annotated classes we need to
                 *  - select Spring managed services and register them with ServiceRegistry
                 *  - create instances of non-spring managed services and register them with ServiceRegistry
                 *  Non-spring managed services will be added to a temporary list (nonSpringServices) which
                 *  will be processed later
                 */
                List<Class<? extends Object>> nonSpringServices = new ArrayList<Class<? extends Object>>();
                org.springframework.context.ApplicationContext aCtx = org.springframework.web.context.support.WebApplicationContextUtils.getWebApplicationContext(servletContext);
                if (aCtx == null) {
                    return candidateServices;
                }
                String[] beanNames = aCtx.getBeanDefinitionNames();
                for (Class<?> candidateService : candidateServices) {

                    Boolean foundBean = false;
                    for (String name : beanNames) {
                        Object bean = aCtx.getBean(name);
                        Class<?> clazz = bean.getClass();

                        if (candidateService.equals(clazz)) {
                            foundBean = true;
                            for (Method method : bean.getClass().getDeclaredMethods()) {
                                registerServiceMethod(method, bean.getClass(), bean);
                                registerDownloadableMethod(method, bean.getClass(), bean);
                            }
                        }
                    }

                    if (!foundBean)
                        nonSpringServices.add(candidateService);
                }
                
                return nonSpringServices;
            }
        }
        
        
        SpringHelper helper = new SpringHelper();
        this.candidateServices = helper.execute(); // processed in initializeServices

    }

    public Object registerServiceMethod(Method method, Class<?> service, Object instance) {
        Service annotation = method.getAnnotation(Service.class);
        if (annotation != null) {
            try {
                if (instance == null) 
                    instance = service.newInstance();

                MethodCallServiceAdapter adapter = new MethodCallServiceAdapter(instance, method, annotation);
                ServiceRegistry.registerService(adapter, true);

            } catch (Exception e) {
                LOG.error("Could not register service method (" + method +") because " + e);
            }
        }

        return instance;
    }

    public Object registerDownloadableMethod(Method method, Class<?> service, Object instance) {
        Downloadable dAnnotation = method.getAnnotation(Downloadable.class);
        if (dAnnotation != null) {
            try {

                if (instance == null) 
                    instance = service.newInstance();

                ServiceRegistry.registerDownloadable(service, instance, method, dAnnotation, true);

            } catch (Exception e) {
                LOG.error("Could not register service method (" + method +") because " + e);
            }
        }

        return instance;
    }
}
