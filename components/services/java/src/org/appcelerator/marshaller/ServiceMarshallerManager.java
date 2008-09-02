
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

package org.appcelerator.marshaller;

import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
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
            try
            {
                return this.method.invoke(this.instance, args);

            }
            catch (Exception e) // don't lose underlying exceptions
            {
                if (e instanceof InvocationTargetException
                        && e.getCause() instanceof Exception)
                {
                    throw (Exception) e.getCause();
                }
            }
            
            return null;
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
    
    public static String encode (String contentType, List<Message> messages, String sessionid, OutputStream output) throws Exception
    {
        ServiceMarshallerAdapter encoder = encoders.get(contentType);
        if (encoder!=null)
        {
            return (String)encoder.call(messages, sessionid, output);
        }
		else
		{
			throw new Exception("no serialized for "+contentType);
		}
    }
}
