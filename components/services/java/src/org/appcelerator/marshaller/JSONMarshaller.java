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

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
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
import org.appcelerator.messaging.MessageDataType;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.util.Util;

/**
 * Marshaller for encoding and decoding incoming/outgoing JSON messages.
 */
public class JSONMarshaller
{
    
    private static final Log LOG = LogFactory.getLog(JSONMarshaller.class);
    
    @ServiceMarshaller(contentTypes={"text/json","application/json"},direction=ServiceMarshaller.Direction.DECODE)
    public void decode (InputStream input, List<Message> messages) throws Exception
    {
        String buffer = readBuffer(input);
        JSONObject o = JSONObject.fromObject(buffer);
        JSONObject request = o.getJSONObject("request");
        
        Long timestamp = request.getLong("timestamp");
        Float tz = new Float(request.getDouble("tz"));

        JSONArray jsonMessages = request.getJSONArray("messages");
        for (Object jsonMessage : jsonMessages) {

            if (!(jsonMessage instanceof JSONObject))
                continue;

            try {
                messages.add(decodeMessage((JSONObject) jsonMessage, timestamp, tz));
            } catch (Exception e) {
                LOG.debug("Could not parse message: " + e);
            }

        }
        
    }
    /**
     * Deserialize an Appcelerator Message object given a JSONObject
     * @param smessage the serialized version of the message
     * @param timestamp the timestamp for when this message was sent
     * @param tz the timezone offset for this message
     * @return the deserialied Message object
     * @throws Exception if an error is encountered during deserialization
     */
    private Message decodeMessage(JSONObject smessage, Long timestamp, Float tz) throws Exception {
        Message message = new Message();
        message.setTimezoneOffset(tz);
        message.setSentTimestamp(timestamp);
        
        message.setRequestid(smessage.getString("requestid"));
        message.setDataType(MessageDataType.valueOf(smessage.getString("datatype")));
        message.setType(smessage.getString("type"));
        message.setDirection(MessageDirection.INCOMING);
        
        try
        {
            message.setData(new JSONMessageDataObject(smessage.getJSONObject("data")));
        }
        catch (JSONException ex)
        {
            throw new MessageDataObjectException(ex);
        }
        
        message.setScope(smessage.getString("scope"));
        
        String version = smessage.optString("version");
        if (version==null || version.equals(""))
        {
            version="1.0";
        }
        message.setVersion(version);

        return message;
    }

    @ServiceMarshaller(contentTypes={"text/json","application/json"},direction=ServiceMarshaller.Direction.ENCODE)
    public String encode (List<Message> messages, OutputStream in) throws Exception
    {
        long timestamp = System.currentTimeMillis();
        float timezoneOffset = MessageUtils.getTimezoneOffset();
        
        // use the first message as a reference for the instanceid and sessiondid
        // :(
        Message m = messages.get(0);
        String sessionid = m.getSessionid();
        String instanceid = m.getInstanceid();
        
        JSONObject out = new JSONObject();
        out.put("version", "1.0");
        out.put("encoding", "UTF-8");
        out.put("sessionid", sessionid);
        out.put("instanceid", instanceid);
        out.put("timestamp", timestamp);
        out.put("tz", timezoneOffset);
        
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
        
        smessage.put("timestamp", String.valueOf(message.getTimestamp()));
        smessage.put("requestid", message.getRequestid());
        smessage.put("type", message.getType());
        smessage.put("direction", message.getDirection().name());
        smessage.put("datatype", message.getDataType().name());
        smessage.put("scope", message.getScope());
        smessage.put("version", message.getVersion());

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

        BufferedReader in = new BufferedReader(new InputStreamReader(input));
        while ((line = in.readLine()) != null) {
            buffer.append(line);
        }
        return buffer.toString();
    }
}
