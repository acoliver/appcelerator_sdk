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
import java.io.PrintWriter;
import java.util.List;

import org.appcelerator.annotation.ServiceMarshaller;
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
public class XMLJSONMarshaller
{
    @ServiceMarshaller(contentTypes="text/xml",direction=ServiceMarshaller.Direction.DECODE)
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
                msg.setTimezoneOffset(tz);
                msg.setSentTimestamp(timestamp);
                messages.add(msg);
            }
        }
    }
    
    @ServiceMarshaller(contentTypes="text/xml",direction=ServiceMarshaller.Direction.ENCODE)
    public String encode (List<Message> messages, OutputStream out) throws Exception
    {
        // use the first message as a reference for the instanceid and sessiondid
        Message m = messages.get(0);
        
        Document xml = MessageUtils.createMessageXML(m.getSessionid(),m.getInstanceid());
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
