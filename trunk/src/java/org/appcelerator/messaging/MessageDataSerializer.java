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
package org.appcelerator.messaging;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Date;

import org.appcelerator.annotation.MessageAttr;
import org.appcelerator.spring.AnnotationUtil;
import org.appcelerator.util.DateUtil;

/**
 * MessageDataSerializer handles serialization of a particular object to a transportable IMessageDataObject.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class MessageDataSerializer
{
    /**
     * Method type for a bean method.
     */
    enum MethodType
    {
        /**
         * READ method
         */
        READ,
        /**
         * WRITE method
         */
        WRITE
    }

    /**
     * find a particular bean method
     *
     * @param pd   property descriptors
     * @param name property name
     * @param type method type
     * @return found method or <code>null</code> if not found
     */
    public static Method getMethod(PropertyDescriptor pd[], String name, MethodType type)
    {
        for (PropertyDescriptor d : pd)
        {
            if (d.getName().equals(name))
            {
                return (type.equals(MethodType.READ)) ? d.getReadMethod() : d.getWriteMethod();
            }
        }
        return null;
    }

    /**
     * give a java bean, return a IMessageDataObject serialized for the
     * bean using the MessageAttr annotation of fields that should be
     * serialized for this class.
     *
     * @param obj object to serialize
     * @return transportable IMessageDataObject from specified object
     */
    public static IMessageDataObject serialize(Object obj)
    {
        final IMessageDataObject dataobj = MessageUtils.createMessageDataObject();

        try
        {
            final BeanInfo beaninfo = Introspector.getBeanInfo(obj.getClass());
            final PropertyDescriptor pd[] = beaninfo.getPropertyDescriptors();

            AnnotationUtil.fieldVisitor(obj, new AnnotationUtil.IFieldVisitor()
            {
                public void visit(Object bean, Field field)
                {
                    String name = field.getName();
                    MessageAttr attr = field.getAnnotation(MessageAttr.class);
                    String prop = attr.name();
                    if (prop.equals(""))
                    {
                        prop = name;
                    }
                    try
                    {
                        Method read = getMethod(pd, name, MethodType.READ);
                        if (read != null)
                        {
                            Object value = read.invoke(bean);
                            if (value == null)
                            {
                                value = MessageUtils.getMessageDataNullValue();
                            }
                            if (value instanceof Date)
                            {
                                Date date = (Date) value;
                                value = DateUtil.getDateAsAppFormat(date);
                            }
                            dataobj.put(prop, value);
                        }
                    }
                    catch (Exception ex)
                    {
                        ex.printStackTrace();
                    }
                }
            }, MessageAttr.class);
        }
        catch (Exception ex)
        {
            ex.printStackTrace();
        }
        return dataobj;
    }
}
