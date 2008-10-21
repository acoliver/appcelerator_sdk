
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
import java.io.PrintWriter;
import java.util.List;

import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.util.Util;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * XML-JSON service marshaller for communicating with Appcelerator client.
 */
@SuppressWarnings("unused")
public class XMLJSONMarshaller extends ServiceMarshaller
{
    public void decode (InputStream input, List<Message> messages) throws Exception
    {
        // parse the incoming XML
        Document xml = Util.parse(input);

        Element root = xml.getDocumentElement();
        long timestamp = Long.parseLong(root.getAttribute("timestamp"));
        float tz = Float.parseFloat(root.getAttribute("tz"));

        // walk through each incoming request message and decode
        NodeList nodes = root.getChildNodes();
        for (int c=0;c<nodes.getLength();c++)
        {
            Node node = nodes.item(c);
            if (node.getNodeType()==Node.ELEMENT_NODE && node.getNodeName().equals("message"))
            {
                Message msg = MessageUtils.fromXML((Element)node,null);
                messages.add(msg);
            }
        }
    }
    
    public String encode (List<Message> messages, String sessionid, OutputStream out) throws Exception
    {
        // use the first message as a reference for the instanceid and sessiondid
        Message m = messages.get(0);
        
        Document xml = MessageUtils.createMessageXML(sessionid);
        Element root = xml.getDocumentElement();
        
        for (Message message : messages)
        {
            MessageUtils.toXML(message, root);
        }
        
        // now serialize the XML to the servlet's output stream
        PrintWriter writer = new PrintWriter(out,true);
        Util.serialize(xml, writer, "UTF-8");
        writer.flush();
        
        return "text/xml;charset=UTF-8";
    }
}
