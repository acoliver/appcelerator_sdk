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
package org.appcelerator.messaging;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;

/**
 * MessageDataSerializer handles serialization of a particular object to a transportable IMessageDataObject.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
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
/*
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
*/
        return dataobj;
    }
}
