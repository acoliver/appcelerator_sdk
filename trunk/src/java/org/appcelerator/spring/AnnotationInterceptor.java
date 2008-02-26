/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
package org.appcelerator.spring;

import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashSet;

import net.sf.cglib.proxy.Callback;
import net.sf.cglib.proxy.CallbackFilter;
import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;
import net.sf.cglib.proxy.NoOp;

import org.springframework.aop.framework.Advised;
import org.springframework.aop.framework.AdvisedSupport;

/**
 * AnnotationInterceptor is required to be used instead of a normal ProxyFactoryBean since they
 * don't currently support AOP interception of private, protected and package-protected methods.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class AnnotationInterceptor
{
    /**
     * create an annotated method interceptor against a target class and invoke the method interceptor each time
     * the annotated method (as a pointcut) is executed.
     *
     * @param target                target class
     * @param annotationInterceptor method interceptor
     * @param annotations           annotations to intercept
     * @return proxied object to perform interception
     * @throws Exception upon creation error
     */
    public static Object create(Class target, MethodInterceptor annotationInterceptor, final Class<? extends Annotation>... annotations) throws Exception
    {
        return create(target, annotationInterceptor, null, null, annotations);
    }

    /**
     * create an annotated method interceptor against a target class and invoke the method interceptor each time
     * the annotated method (as a pointcut) is executed.
     *
     * @param target                target class
     * @param annotationInterceptor method interceptor
     * @param constructorArgTypes   argument type(s) defining constructor signature
     * @param constructorArgs       arguments for constructor matching specified type(s)
     * @param annotations           annotations to intercept
     * @return proxied object to perform interception
     * @throws Exception upon creation error
     */
    public static Object create(Class target, MethodInterceptor annotationInterceptor, Class[] constructorArgTypes, Object[] constructorArgs, final Class<? extends Annotation>... annotations) throws Exception
    {
        // this is a sanity check to make sure we don't have any illegal visibility methods for annotations
        HashSet<Method> methodTargets = new HashSet<Method>();
        for (Class<? extends Annotation> annotation : annotations)
        {
            AnnotationUtil.collectMethods(target, methodTargets, annotation);
            for (Method method : methodTargets)
            {
                if (Modifier.isPrivate(method.getModifiers()))
                {
                    throw new IllegalArgumentException("found @" + annotation.getName() + " on private method: " + method);
                }
            }
            methodTargets.clear();
        }

        Enhancer enhancer = new Enhancer();
        enhancer.setUseFactory(true);
        enhancer.setSuperclass(target);
        enhancer.setInterceptDuringConstruction(false);
        enhancer.setInterfaces(new Class[]{Advised.class});
        enhancer.setAttemptLoad(true);
        final AdvisedSupport advised = new AdvisedSupport();
        final MethodInterceptor advisedInterceptor = new MethodInterceptor()
        {
            public Object intercept(Object arg0, Method method, Object[] args, MethodProxy arg3) throws Throwable
            {
                Class targetClass = method.getDeclaringClass();
                String methodName = method.getName();
                Class parameterTypes[] = method.getParameterTypes();
                try
                {
                    Method advisedMethod = targetClass.getMethod(methodName, parameterTypes);
                    return advisedMethod.invoke(advised, args);
                }
                catch (InvocationTargetException te)
                {
                    throw te.getTargetException();
                }
            }
        };
        enhancer.setCallbackFilter(new CallbackFilter()
        {
            public int accept(Method method)
            {
                for (Class<? extends Annotation> annotation : annotations)
                {
                    if (method.isAnnotationPresent(annotation))
                    {
                        return 1;
                    }
                }
                if (method.getDeclaringClass() == Advised.class)
                {
                    return 2;
                }
                return 0;
            }
        });

        enhancer.setCallbacks(new Callback[]{NoOp.INSTANCE, annotationInterceptor, advisedInterceptor});
        Object targetProxy;
        if (null != constructorArgTypes && 0 < constructorArgTypes.length && null != constructorArgs && 0 < constructorArgs.length)
        {
            targetProxy = enhancer.create(constructorArgTypes, constructorArgs);
        }
        else
        {
            targetProxy = enhancer.create();
        }

        advised.setTarget(targetProxy);
        return targetProxy;
    }
}
