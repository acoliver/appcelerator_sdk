
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

import java.security.Principal;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.GregorianCalendar;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;
import net.sf.json.JSONNull;

import org.appcelerator.util.DateUtil;
import org.appcelerator.util.TimeFormat;
import org.appcelerator.util.Util;
import org.appcelerator.messaging.JSONMessageDataObject;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * MessageUtils is a collection of trusty utility methods to help with messaging.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class MessageUtils
{
    private static int timezoneOffset = -1;
    static
    {
        long timestamp = System.currentTimeMillis();
        timezoneOffset = (int)(Calendar.getInstance().getTimeZone().getOffset(timestamp) / TimeFormat.ONE_HOUR);
    }
    
    /**
     * return this servers timezone offset from GMT
     * 
     * @return
     */
    public static int getTimezoneOffset ()
    {
        return timezoneOffset;
    }
    
    public static Document createMessageXML (String sessionId) throws Exception
    {
    	return createMessageXML(sessionId, "UTF-8");
    }
    public static Document createMessageXML (String sessionId, String encoding) throws Exception
    {
        long timestamp = System.currentTimeMillis();
        return Util.toXML("<?xml version='1.0' encoding=\""+encoding+"\"?><messages timestamp='"+timestamp+"' tz='"+timezoneOffset+"' version='1.0' sessionid='" + sessionId + "' />",encoding);
    }
    /**
     * given a message, append it to root and return it
     *
     * @param message serializes a message to XML document
     * @param root    root element for placement of serialized XML message document
     * @return message element
     * @throws Exception upon creational error
     */
    public static Element toXML(Message message, Element root) throws Exception
    {
        Element elem = root.getOwnerDocument().createElement("message");
        root.appendChild(elem);
        elem.setAttribute("type", message.getType());
        elem.setAttribute("version", message.getVersion());
        elem.setAttribute("scope", message.getScope());
        elem.setAttribute("timestamp", String.valueOf(message.getTimestamp()));

        // messages no longer track this data, but old
        // clients may be expecting them
        elem.setAttribute("requestid", "1");
        elem.setAttribute("datatype", "JSON");

        IMessageDataObject data = message.getData();
        elem.appendChild(root.getOwnerDocument().createCDATASection(data.toDataString()));
        root.appendChild(elem);
        return elem;
    }

    /**
     * constructs message from XML
     *
     * @param element serialized message
     * @param user    user originating message
     * @return deserialized message
     */
    public static Message fromXML(Element element, Principal user) throws Exception
    {
        Message message = new Message(user);
        message.setType(element.getAttribute("type"));
        
        String version = element.getAttribute("version");
        if (version==null || version.equals(""))
        {
            version="1.0";
        }
        message.setVersion(version);
        
        message.setScope(element.getAttribute("scope"));
        message.setData(MessageUtils.createMessageDataObject(element));

        return message;
    }

    /**
     * gets a GMT date from the message sent timestamp
     *
     * @param message message to pull timestamp from
     * @return GMT date
     */
    public static Date getGMTDateTimestamp(Message message)
    {
        Calendar calendar = new GregorianCalendar();
        calendar.setTime(new Date(message.getTimestamp()));
        calendar.setTimeZone(DateUtil.GMT_TZ);
        return calendar.getTime();
    }

    /**
     * creates a response message from a request message.  defaulting direction to outgoing, type to request type, and
     * data type to request data type.
     *
     * @param message request message to base response on
     * @return response message
     */
    public static Message createResponseMessage(Message message)
    {
        Message responseMessage = new Message(message);
        responseMessage.setData(new JSONMessageDataObject());
        return responseMessage;
    }

    /**
     * gets the message data as a JSONObject
     *
     * @param message message to pull data from
     * @return JSONObject containing message data
     * @throws JSONException upon JSON error
     */
    public static JSONObject getJSONObjectData(Message message) throws JSONException
    {
        Object data = message.getData();
        String jsonData;
        if (data instanceof Element)
        {
            jsonData = Util.getNodeContent((Element) data);
        }
        else if (data instanceof String)
        {
            jsonData = (String) data;
        }
        else if (data instanceof JSONMessageDataObject)
        {
            return ((JSONMessageDataObject)data).getJSONObject();
        }
        else
        {
            throw new IllegalArgumentException("unhandled class type for JSON " + data.getClass() + " for => " + message);
        }

        return JSONObject.fromObject(jsonData);
    }

    /**
     * return the null version of a MessageDataObject's value
     *
     * @return null value
     */
    public static Object getMessageDataNullValue()
    {
        return JSONNull.getInstance();
    }
    
    /**
     * given a string of JSON encoded data, return a IMessageDataObject
     * 
     * @param jsonStringData
     * @return
     * @throws MessageDataObjectException
     */
    public static IMessageDataObject createMessageDataObject (String jsonStringData)   throws MessageDataObjectException
    {
        try
        {
            return new JSONMessageDataObject(JSONObject.fromObject(jsonStringData));
        }
        catch (JSONException ex)
        {
            throw new MessageDataObjectException(ex);
        }
    }

    /**
     * creates a message data object of appropriate type populated from the message
     *
     * @param message message to get datatype and data from
     * @return created message data object
     * @throws MessageDataObjectException upon creational error
     */
    public static IMessageDataObject createMessageDataObject(Element element) throws MessageDataObjectException
    {
        String jsonStringData = Util.getNodeContent(element);
        try
        {
            return new JSONMessageDataObject(JSONObject.fromObject(jsonStringData));
        }
        catch (JSONException ex)
        {
            throw new MessageDataObjectException(ex);
        }
    }

    /**
     * create a generic empty message data object container
     *
     * @return empty message data object container
     */
    public static IMessageDataObject createMessageDataObject()
    {
        return new JSONMessageDataObject();
    }

    /**
     * deep copies a message data object to a new instance.
     *
     * @param messageDataObject object to copy
     * @return new message data object
     * @throws MessageDataObjectException upon error
     */
    @SuppressWarnings("unchecked")
    public static IMessageDataObject copyMessageDataObject(IMessageDataObject messageDataObject) throws MessageDataObjectException
    {
        IMessageDataObject newMessageDataObject = createMessageDataObject();

        for (String key : messageDataObject.keySet())
        {
            Class cls = messageDataObject.getClass(key);
            if (null != cls)
            {
                if (cls.isAssignableFrom(IMessageDataList.class))
                {
                    newMessageDataObject.put(key, copyMessageDataList(messageDataObject.getObjectArray(key)));
                }
                else
                {
                    if (cls.equals(String.class))
                    {
                        newMessageDataObject.put(key, messageDataObject.getString(key));
                    }
                    else if (cls.equals(Integer.class))
                    {
                        newMessageDataObject.put(key, messageDataObject.getInt(key));
                    }
                    else if (cls.equals(Long.class))
                    {
                        newMessageDataObject.put(key, messageDataObject.getLong(key));
                    }
                    else if (cls.equals(Double.class))
                    {
                        newMessageDataObject.put(key, messageDataObject.getDouble(key));
                    }
                    else if (cls.equals(Boolean.class))
                    {
                        newMessageDataObject.put(key, messageDataObject.getBoolean(key));
                    }
                    else
                    {
                        newMessageDataObject.put(key, messageDataObject.getObject(key));
                    }
                }
            }
        }

        return newMessageDataObject;
    }

    /**
     * deep copies a message data list to a new instance
     *
     * @param messageDataList list to copy
     * @return new message data list
     * @throws MessageDataObjectException upon error
     */
    @SuppressWarnings("unchecked")
    public static <T> IMessageDataList<T> copyMessageDataList(IMessageDataList<T> messageDataList) throws MessageDataObjectException
    {
        IMessageDataList<T> newMessageDataList = createMessageDataObjectList();

        if (newMessageDataList.getClass().getTypeParameters()[0].getGenericDeclaration().isAssignableFrom(IMessageDataObject.class))
        {
            for (T data : messageDataList)
            {
                newMessageDataList.add((T) copyMessageDataObject((IMessageDataObject) data));
            }
        }
        else
        {
            for (T data : messageDataList)
            {
                newMessageDataList.add(data);
            }
        }

        return newMessageDataList;
    }

    /**
     * create an empty IMessageDataList parameterized with the generic T class
     *
     * @param <T> type to encapsulate
     * @return empty message data object list
     */
    public static <T> IMessageDataList<T> createMessageDataObjectList()
    {
        return createMessageDataObjectList(null);
    }

    /**
     * return a IMessageDataList parameterized with the generic T class and pass in a
     * Collection which contains T
     *
     * @param <T> type to encapsulate
     * @param obj collection to populate message data list with
     * @return populated message data object list
     */
    public static <T> IMessageDataList<T> createMessageDataObjectList(Collection<? extends T> obj)
    {
        JSONMessageDataList<T> list = new JSONMessageDataList<T>();
        if (obj != null)
        {
            list.addAll(obj);
        }
        return list;
    }

    /**
     * return a IMessageDataList parameterized with the generic T class and pass in a
     * Collection which contains T and use the IMessageDataMarshaller<T> for custom marshalling
     *
     * @param <T>        type to encapsulate
     * @param obj        collection to populate message data list with
     * @param marshaller marshaller to use when serializing obj collection
     * @return populated message data object list
     */
    public static <T> IMessageDataList<IMessageDataObject> createMessageDataObjectList(Collection<? extends T> obj, IMessageDataMarshaller<T> marshaller)
    {
        JSONMessageDataList<IMessageDataObject> list = new JSONMessageDataList<IMessageDataObject>();
        if (obj != null)
        {
            for (T t : obj)
            {
                IMessageDataObject container = MessageUtils.createMessageDataObject();
                marshaller.marshal(t, container);
                list.add(container);
            }
        }
        return list;
    }


}
