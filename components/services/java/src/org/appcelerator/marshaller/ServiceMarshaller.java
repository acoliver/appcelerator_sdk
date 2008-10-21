
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
import java.util.List;

import org.appcelerator.messaging.Message;

/**
 * annotation that ServiceMarshaller methods will implement for
 * encoding and decoding of service data
 */

public class ServiceMarshaller
{
    
    public void decode (String contentType, InputStream input, List<Message> messages) throws Exception
    {
        ServiceMarshaller marshaller;
        if (contentType == "text/json" || contentType == "application/json")
        {
           marshaller = new JSONMarshaller();
        }
        else if (contentType == "text/xml")
        {
            marshaller = new XMLJSONMarshaller();
        }
        else
        {
            throw new Exception("no deserializer for "+contentType);
        }
        
        marshaller.decode(contentType, input, messages);
    }
    
    public String encode (String contentType, List<Message> messages, String sessionid, OutputStream output) throws Exception
    {
        ServiceMarshaller marshaller;
        if (contentType == "text/json" || contentType == "application/json")
        {
           marshaller = new JSONMarshaller();
        }
        else if (contentType == "text/xml")
        {
            marshaller = new XMLJSONMarshaller();
        }
        else
        {
            throw new Exception("no serialized for "+contentType);
        }
        
       return marshaller.encode(contentType, messages, sessionid, output);
    }
}
