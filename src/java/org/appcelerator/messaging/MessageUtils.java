/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
package org.appcelerator.messaging;

import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.GregorianCalendar;

import javax.security.auth.Subject;

import org.appcelerator.json.JSONException;
import org.appcelerator.json.JSONObject;
import org.appcelerator.util.DateUtil;
import org.appcelerator.util.TimeFormat;
import org.appcelerator.util.Util;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * MessageUtils is a collection of trusty utility methods to help with messaging.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
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
    
    public static Document createMessageXML (String sessionId, String instanceId) throws Exception
    {
    	return createMessageXML(sessionId, instanceId,"UTF-8");
    }
    public static Document createMessageXML (String sessionId, String instanceId, String encoding) throws Exception
    {
        long timestamp = System.currentTimeMillis();
        return Util.toXML("<?xml version='1.0' encoding=\""+encoding+"\"?><messages timestamp='"+timestamp+"' tz='"+timezoneOffset+"' version='1.0' sessionid='" + sessionId + "' instanceid='"+instanceId+"' />",encoding);
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
        elem.setAttribute("timestamp", String.valueOf(message.getTimestamp()));
        elem.setAttribute("requestid", message.getRequestid());
        elem.setAttribute("type", message.getType());
        elem.setAttribute("direction", message.getDirection().name());
        elem.setAttribute("datatype", message.getDataType().name());
        elem.setAttribute("scope", message.getScope());
        elem.setAttribute("version", message.getVersion());
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
    public static Message fromXML(Element element, Subject user) throws Exception
    {
        Message message = new Message(user);
        message.setRequestid(element.getAttribute("requestid"));
        message.setDataType(MessageDataType.valueOf(element.getAttribute("datatype")));
        message.setType(element.getAttribute("type"));
        message.setDirection(MessageDirection.INCOMING);
        message.setData(MessageUtils.createMessageDataObject(element));
        message.setScope(element.getAttribute("scope"));
        String version = element.getAttribute("version");
        if (version==null)
        {
            version="1.0";
        }
        message.setVersion(version);
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
        responseMessage.setDirection(MessageDirection.OUTGOING);
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
        if (!message.getDataType().equals(MessageDataType.JSON))
        {
            throw new IllegalArgumentException("message is not a JSON message data type: " + message);
        }
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
        else
        {
            throw new IllegalArgumentException("unhandled class type for JSON " + message);
        }

        return new JSONObject(jsonData);
    }

    /**
     * return the null version of a MessageDataObject's value
     *
     * @return null value
     */
    public static Object getMessageDataNullValue()
    {
        return JSONObject.NULL;
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
            return new JSONMessageDataObject(new JSONObject(jsonStringData));
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
            return new JSONMessageDataObject(new JSONObject(jsonStringData));
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
