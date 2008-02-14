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

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.annotation.InjectBeans;
import org.appcelerator.spring.AnnotationUtil.IFieldVisitor;
import org.springframework.beans.factory.BeanFactory;

/**
 * InjectBeanVisitor
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class InjectBeanVisitor implements IFieldVisitor, AnnotationUtil.IMethodVisitor
{
    private static final Logger LOG = Logger.getLogger(InjectBeanVisitor.class);
    private final BeanFactory factory;

    public InjectBeanVisitor(BeanFactory factory)
    {
        this.factory = factory;
    }

    /* (non-Javadoc)
    * @see org.app.annotation.AnnotationUtil.IFieldVisitor#visit(java.lang.Object, java.lang.reflect.Field)
    */
    public void visit(Object bean, Field field) throws Exception
    {
        // can't set final methods
        if (!Modifier.isFinal(field.getModifiers()))
        {
            // see if its an annotated @InjectBean
            InjectBean injectBean = field.getAnnotation(InjectBean.class);
            if (injectBean != null)
            {
                // see if we should use a spring bean name different than the field
                String name = injectBean.name();
                if (name.equals(""))
                {
                    name = field.getName();
                }

                boolean found = factory.containsBean(name);
                
                // look up our bean by it's expected type
                Object ref = (found) ? factory.getBean(name, field.getType()) : null;
                field.setAccessible(true);

                if (!found && injectBean.required())
                {
                    if (injectBean.required())
                    {
                        throw new IllegalArgumentException("Couldn't find bean named: "+name+" for "+field.getDeclaringClass().getName());
                    }
                }
                // inject our spring bean reference into the variables value
                if (LOG.isDebugEnabled())
                {
                    LOG.debug("calling " + bean.getClass().getName() + "." + field.getName() + " = " + ref + " for " + bean);
                }
                field.set(bean, ref);
            }
            else
            {
                InjectBeans injectBeans = field.getAnnotation(InjectBeans.class);
                if (null != injectBeans)
                {
                    if (!field.getType().isInstance(Collection.class))
                    {
                        throw new IllegalArgumentException("unable to inject field " + field.getName() + " expected Collection instance");
                    }

                    field.setAccessible(true);
                    Collection<Object> collection = new ArrayList<Object>(injectBeans.names().length);
                    for (String name : injectBeans.names())
                    {
                        collection.add(factory.getBean(name));
                    }
                    if (LOG.isDebugEnabled())
                    {
                        LOG.debug("calling " + bean.getClass().getName() + "." + field.getName() + " = " + collection + " for " + bean);
                    }
                    field.set(bean, collection);
                }
            }
        }
    }

    public void visit(Object bean, Method method) throws Exception
    {
        InjectBeans injectBeans = method.getAnnotation(InjectBeans.class);
        if (injectBeans != null)
        {
            method.setAccessible(true);
            for (String name : injectBeans.names())
            {
                method.invoke(bean, factory.getBean(name));
            }
        }
    }
}
