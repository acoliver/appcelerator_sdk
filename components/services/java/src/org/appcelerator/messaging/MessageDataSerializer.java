
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
