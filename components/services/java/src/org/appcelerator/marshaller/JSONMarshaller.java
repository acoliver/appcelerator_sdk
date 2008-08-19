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

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.List;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.ServiceMarshaller;
import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataObjectException;

/**
 * Marshaller for encoding and decoding incoming/outgoing JSON messages.
 */
public class JSONMarshaller
{
    
    private static final Log LOG = LogFactory.getLog(JSONMarshaller.class);
    
    @SuppressWarnings("unused")
    @ServiceMarshaller(contentTypes={"text/json","application/json"},direction=ServiceMarshaller.Direction.DECODE)
    public void decode (InputStream input, List<Message> messages) throws Exception
    {
        String buffer = readBuffer(input);
        JSONObject request = JSONObject.fromObject(buffer);
        
        Long timestamp = System.currentTimeMillis();
        try {
            timestamp = Long.parseLong(request.getString("timestamp"));
        } catch (NumberFormatException e) {
            LOG.warn("Could not parse message timestamp");
            
        }
        
            String version = request.getString("version");

        JSONArray jsonMessages = request.getJSONArray("messages");
        for (Object jsonMessage : jsonMessages) {

            if (!(jsonMessage instanceof JSONObject))
                continue;

            try {
                messages.add(decodeMessage((JSONObject) jsonMessage, timestamp));
            } catch (Exception e) {
                LOG.debug("Could not parse message: " + e);
            }

        }
        
    }
    /**
     * Deserialize an Appcelerator Message object given a JSONObject
     * @param smessage the serialized version of the message
     * @param timestamp the timestamp for when this message was sent
     * @return the deserialied Message object
     * @throws Exception if an error is encountered during deserialization
     */
    private Message decodeMessage(JSONObject smessage, Long timestamp) throws Exception {
        Message message = new Message();
        message.setTimestamp(timestamp);
        
        message.setType(smessage.getString("type"));
        String version = smessage.optString("version");

        if (version==null || version.equals(""))
        {
            version="1.0";
        }
        message.setVersion(version);
        message.setScope(smessage.getString("scope"));

        try
        {
            message.setData(new JSONMessageDataObject(smessage.getJSONObject("data")));
        }
        catch (JSONException ex)
        {
            throw new MessageDataObjectException(ex);
        }
        

        return message;
    }

    @ServiceMarshaller(contentTypes={"text/json","application/json"},direction=ServiceMarshaller.Direction.ENCODE)
    public String encode (List<Message> messages, String sessionid, OutputStream in) throws Exception
    {

        JSONObject out = new JSONObject();
        out.put("version", "1.0");
        out.put("timestamp", System.currentTimeMillis());
        
        if (sessionid != null)
            out.put("sessionid", sessionid);

        JSONArray jsonMessages = new JSONArray();
        for (Message message : messages) {
            jsonMessages.add(encodeMessage(message));
        }
        out.put("messages", jsonMessages);

        // now serialize the JSON to the servlet's output stream
        byte[] utf8Out = out.toString().getBytes("UTF-8");
        in.write(utf8Out);
        in.flush();

        return "application/json;charset=UTF-8";
    }
    /**
     * Serialize a message into a JSONObject
     * @param message the message to serialize
     * @return the serialized message
     */
    private Object encodeMessage(Message message)
    {
        JSONObject smessage = new JSONObject();
        
        smessage.put("type", message.getType());
        smessage.put("version", message.getVersion());
        smessage.put("scope", message.getScope());
        if (message.getData() instanceof JSONMessageDataObject) {
            JSONMessageDataObject dobject = (JSONMessageDataObject) message.getData();
            smessage.put("data", dobject.getJSONObject());
        } else {
            smessage.put("data", message.getData().toDataString());
        }

        return smessage;
    }

    /**
     * Read an input stream into a StringBuffer
     * @param input the InputStream to read
     * @return a String version of the final StringBuffer
     * @throws Exception if there is an IO error
     */
    private String readBuffer(InputStream input) throws Exception {
        String line;
        StringBuffer buffer = new StringBuffer();

        BufferedReader in = new BufferedReader(new InputStreamReader(input, "UTF-8"));
        while ((line = in.readLine()) != null) {
            buffer.append(line);
        }
        return buffer.toString();
    }
}
