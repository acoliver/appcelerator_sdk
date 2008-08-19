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
@SuppressWarnings("unused")
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
                messages.add(msg);
            }
        }
    }
    
    @ServiceMarshaller(contentTypes="text/xml",direction=ServiceMarshaller.Direction.ENCODE)
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
