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
import org.appcelerator.annotation.Downloadable;
import org.appcelerator.annotation.Service;
import org.appcelerator.annotation.ServiceLocator;
import org.appcelerator.service.MethodCallServiceAdapter;
import org.appcelerator.service.ServiceRegistry;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

/**
 * Utility class which will auto-register all @Service method implementations in the 
 * JVM classpath. It will also associate annotated methods with their corresponding
 * Spring beans.
 */
@ServiceLocator
public class AnnotationBasedLocator implements Locator
{
    private static final Log LOG = LogFactory.getLog(AnnotationBasedLocator.class);
    private List <Class<? extends Object>> candidateServices;
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
        
        /* 
         * initialize Spring services first, so that they can be associated with their respective beans.
         */
        initializeSpringServices(sc);
        
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


    private void initializeSpringServices(ServletContext sc) {

        // don't register any Spring services if we are not running in Servlet
        if (sc == null)
            return;

        // detect if we are running a Spring container, if not -- quit early, as this
        // following code will throw a ClassNotFound exception (bad news bears!)
        if (sc.getAttribute("org.springframework.web.context.WebApplicationContext.ROOT") == null) {
            return;
        }

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
        ApplicationContext aCtx = WebApplicationContextUtils.getRequiredWebApplicationContext(sc);
        String[] beanNames = aCtx.getBeanDefinitionNames();

        for (Class<?> candidateService : this.candidateServices) {

            Boolean foundBean = false;
            for (String name : beanNames) {
                Object bean = aCtx.getBean(name);
                Class<?> clazz = bean.getClass();

                // this is not the bean you are looking for <waves hand>
                if (!candidateService.equals(clazz))
                    continue;

                for (Method method : bean.getClass().getDeclaredMethods()) {
                    registerServiceMethod(method, bean.getClass(), bean);
                    registerDownloadableMethod(method, bean.getClass(), bean);
                }

                if (!foundBean)
                    nonSpringServices.add(candidateService);
            }

            // these will be processed next by the non-Spring location code
            this.candidateServices = nonSpringServices;
        }
    }

    private Object registerServiceMethod(Method method, Class<?> service, Object instance) {
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

    private Object registerDownloadableMethod(Method method, Class<?> service, Object instance) {
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
