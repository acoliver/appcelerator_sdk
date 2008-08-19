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
