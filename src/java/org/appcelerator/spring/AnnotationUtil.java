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
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.apache.log4j.Logger;
import org.springframework.core.BridgeMethodResolver;

/**
 * AnnotationUtil is a collection of handy utils for dealing with annotations.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class AnnotationUtil
{
    private static final Logger LOG = Logger.getLogger(AnnotationUtil.class);

    /**
     * interface for visitation of fields
     */
    public interface IFieldVisitor
    {
        /**
         * called to visit a field on a bean
         *
         * @param bean  bean to visit
         * @param field field to visit
         * @throws Exception upon error
         */
        public void visit(Object bean, Field field) throws Exception;
    }

    /**
     * interface for visitation of method
     */
    public interface IMethodVisitor
    {
        /**
         * called to visit a method on a bean
         *
         * @param bean   bean to visit
         * @param method method to visit
         * @throws Exception upon error
         */
        public void visit(Object bean, Method method) throws Exception;
    }

    /**
     * collect fields for specified class
     *
     * @param clz class to collect fields for
     * @param set set to add collected fields to
     */
    public static void collectFields(Class clz, Set<Field> set)
    {
        if (clz != null)
        {
            Field fields[] = clz.getDeclaredFields();
            if (fields != null)
            {
                set.addAll(Arrays.asList(fields));
            }
            collectFields(clz.getSuperclass(), set);
        }
    }

    /**
     * collect methods for specified class
     *
     * @param clz class to collect methods for
     * @param set set to add collected methods to
     */
    public static void collectMethods(Class clz, Set<Method> set)
    {
        if (clz != null)
        {
            Method methods[] = clz.getDeclaredMethods();
            if (methods != null)
            {
                for (Method method : methods)
                {
                    set.add(BridgeMethodResolver.findBridgedMethod(method));
                }
            }
            collectMethods(clz.getSuperclass(), set);
        }
    }

    /**
     * collect methods that contain the specified annotation
     *
     * @param clz        class to collect methods for
     * @param set        set to add collected methods to
     * @param annotation desired annotation to collect methods for
     */
    public static void collectMethods(Class clz, Set<Method> set, Class<? extends Annotation> annotation)
    {
        collectMethods(clz, set);

        for (Iterator<Method> iterator = set.iterator(); iterator.hasNext();)
        {
            Method method = iterator.next();
            if (!method.isAnnotationPresent(annotation))
            {
                iterator.remove();
            }
        }
    }

    /**
     * visit each method that has the annotation in the bean (or any superclass)
     *
     * @param bean    bean to visit
     * @param visitor method visitor
     * @param classes desired annotations
     * @throws Exception upon error
     */
    public static void methodVisitor(Object bean, IMethodVisitor visitor, Class<? extends Annotation>... classes) throws Exception
    {
        HashSet<Method> methods = new HashSet<Method>();
        collectMethods(bean.getClass(), methods);
        for (Method method : methods)
        {
            for (Class<? extends Annotation> clazz : classes)
            {
                if (method.isAnnotationPresent(clazz))
                {
                    try
                    {
                        visitor.visit(bean, method);
                    }
                    catch (InvocationTargetException te)
                    {
                        throw (Exception) te.getTargetException();
                    }
                }
            }
        }
    }

    /**
     * determines whether a bean has a particular annotation on any of its methods
     *
     * @param bean       bean to test for use of annotation
     * @param annotation annotation to determine usage
     * @return <code>true</code> if any method in bean uses the specified annotation, <code>false</code> otherwise
     * @throws Exception upon error
     */
    public static boolean methodsUseAnnotation(Object bean, Class<? extends Annotation> annotation) throws Exception
    {
        return hasMethodAnnotation(bean.getClass(), annotation);
    }

    /**
     * visit each field that has the annotation in the bean (or any superclass)
     *
     * @param bean    bean to visit
     * @param visitor field visitor
     * @param classes desired annotations
     * @throws Exception upon error
     */
    public static void fieldVisitor(Object bean, IFieldVisitor visitor, Class<? extends Annotation>... classes) throws Exception
    {
        HashSet<Field> fields = new HashSet<Field>();
        collectFields(bean.getClass(), fields);

        for (Field field : fields)
        {
            for (Class<? extends Annotation> clazz : classes)
            {
                if (field.isAnnotationPresent(clazz))
                {
                    try
                    {
                        visitor.visit(bean, field);
                    }
                    catch (InvocationTargetException te)
                    {
                        throw (Exception) te.getTargetException();
                    }
                }
            }
        }
    }

    /**
     * returns true if the beanClass has a method annotation or false if not found
     *
     * @param beanClass bean class to test
     * @param clazz     desired annotation
     * @return <code>true</code> if the class has the annotation on a method, <code>false</code> otherwise
     */
    public static boolean hasMethodAnnotation(Class beanClass, Class<? extends Annotation> clazz)
    {
        if (beanClass == null || Object.class.equals(beanClass))
        {
            return false;
        }
        for (Method method : beanClass.getMethods())
        {
            if (method.getAnnotation(clazz) != null)
            {
                return true;
            }
        }
        for (Method method : beanClass.getDeclaredMethods())
        {
            if (method.getAnnotation(clazz) != null)
            {
                return true;
            }
        }
        return hasMethodAnnotation(beanClass.getSuperclass(), clazz);
    }
}
