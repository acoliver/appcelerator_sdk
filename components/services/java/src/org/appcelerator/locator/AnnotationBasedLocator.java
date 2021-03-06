
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
import org.appcelerator.annotation.Downloadable;
import org.appcelerator.annotation.Service;
import org.appcelerator.service.InterceptorStack;
import org.appcelerator.service.MethodCallServiceAdapter;
import org.appcelerator.service.ServiceRegistry;
import org.appcelerator.service.StackConstructor;


/**
 * Utility class which will auto-register all @Service method implementations in the 
 * JVM classpath. It will also associate annotated methods with their corresponding
 * Spring beans.
 */
public class AnnotationBasedLocator implements ServiceLocator
{
    private static final Log LOG = LogFactory.getLog(AnnotationBasedLocator.class);
    protected List <Class<? extends Object>> candidateServices;
    protected ServletContext servletContext = null;

    public void setServletContext(ServletContext sc) {
        this.servletContext = sc;        
    }
    
    public void findServices() {
        this.candidateServices = Arrays.asList(AnnotationHelper.findAnnotation(Service.class));
        
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
                        
                        /* don't register abstract beans */
                        if (aCtx instanceof org.springframework.context.ConfigurableApplicationContext
                            && ((org.springframework.context.ConfigurableApplicationContext) aCtx).getBeanFactory().getBeanDefinition(name).isAbstract()) {
                            continue;
                        }
                        
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
                InterceptorStack stack = StackConstructor.construct(method, adapter);
                adapter.setStack(stack); 

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
