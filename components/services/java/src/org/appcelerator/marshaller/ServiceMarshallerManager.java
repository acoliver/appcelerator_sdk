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
package org.appcelerator.marshaller;

import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.annotation.ServiceMarshaller;
import org.appcelerator.messaging.Message;

public class ServiceMarshallerManager
{
    private static final Map<String,ServiceMarshallerAdapter> encoders=new HashMap<String,ServiceMarshallerAdapter>();
    private static final Map<String,ServiceMarshallerAdapter> decoders=new HashMap<String,ServiceMarshallerAdapter>();

    static
    {
        for (Class<? extends Object> cls : AnnotationHelper.findAnnotation(ServiceMarshaller.class))
        {
            try
            {
                Object instance = cls.newInstance();
                for (Method method : cls.getMethods())
                {
                    ServiceMarshaller marshaller = method.getAnnotation(ServiceMarshaller.class);
                    if (marshaller!=null)
                    {
                        String types[] = marshaller.contentTypes();
                        for (String type : types)
                        {
                            if (marshaller.direction().equals(ServiceMarshaller.Direction.ENCODE))
                            {
                                encoders.put(type, new ServiceMarshallerAdapter(instance,method));
                            }
                            else
                            {
                                decoders.put(type, new ServiceMarshallerAdapter(instance,method));
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                ex.printStackTrace();
            }
        }
    }
    
    private static final class ServiceMarshallerAdapter
    {
        private final Object instance;
        private final Method method;
        
        ServiceMarshallerAdapter (Object i, Method m)
        {
            this.instance = i;
            this.method = m;
        }
        
        Object call (Object... args) throws Exception
        {
            return this.method.invoke(this.instance, args);
        }
    }
    
    public static void decode (String contentType, InputStream input, List<Message> messages) throws Exception
    {
        ServiceMarshallerAdapter decoder = decoders.get(contentType);
        if (decoder!=null)
        {
            decoder.call(input,messages);
        }
		else
		{
			throw new Exception("no deserializer for "+contentType);
		}
    }
    
    public static String encode (String contentType, List<Message> messages, OutputStream output) throws Exception
    {
        ServiceMarshallerAdapter decoder = encoders.get(contentType);
        if (decoder!=null)
        {
            return (String)decoder.call(messages,output);
        }
		else
		{
			throw new Exception("no serialized for "+contentType);
		}
    }
}
