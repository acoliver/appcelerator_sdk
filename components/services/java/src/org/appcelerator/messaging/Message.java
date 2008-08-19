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
package org.appcelerator.messaging;

import java.io.Serializable;
import java.net.InetAddress;
import java.security.Principal;

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Message Container
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class Message implements Serializable
{
    @SuppressWarnings("unused")
    private static final Log LOG = LogFactory.getLog(Message.class);
    private static final long serialVersionUID = 1L;

    private String type;
    private String version;
    private String scope;
    private IMessageDataObject data;
    
    private long timestamp;
    
    private InetAddress address;
    private transient Principal user;
    private transient HttpSession session;
    private transient ServletRequest servletRequest;
    
    public Message()
    {
    }

    /**
     * get the HttpSession associated with this message
     *
     * @return associated HttpSession
     */
    public HttpSession getSession()
    {
        return this.session;
    }

    /**
     * set the HttpSession for this message
     *
     * @param session HttpSession this message is associated with
     */
    public void setSession(HttpSession session)
    {
        this.session = session;
    }

    /**
     * constructs a new message from the specified user
     *
     * @param user user originating this message
     */
    public Message(Principal user)
    {
        super();
        this.user = user;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * copy constructor.  constructs a new message from an existing message
     *
     * @param m existing message
     */
    public Message(Message m)
    {
        this(m.getType(), m.getVersion(), m.getScope(), m.getData(), m.getUser(), m.getAddress(), m.getTimestamp());
    }

    /**
     * constructs a new message with specified parameters.
     *
     * @param user      user originating this message
     * @param sessionid sessionid associated with this message
     * @param requestid requestid associated with this message
     * @param type      type of message
     * @param direction direction of message
     * @param dataType  data type payload for message
     * @param data      message data in specified data type format
     * @param scope     scope of sender
     * @param addr      inet address of sender
     * @param version   version
     * @param sentTimestamp message sender timestamp
     * @param tz        timezone offset of message sender
     */
    public Message(String type, String version, String scope, IMessageDataObject data, Principal user, InetAddress addr, long timestamp)
    {
        super();
        
        this.type = type;
        this.version = version;
        this.scope = scope;
        this.data = data;
        
        this.user = user;
        this.address = addr;
        this.timestamp = timestamp;
    }

    /**
     * Returns a string representation of the object. In general, the
     * <code>toString</code> method returns a string that
     * "textually represents" this object. The result should
     * be a concise but informative representation that is easy for a
     * person to read.
     * It is recommended that all subclasses override this method.
     * <p/>
     * The <code>toString</code> method for class <code>Object</code>
     * returns a string consisting of the name of the class of which the
     * object is an instance, the at-sign character `<code>@</code>', and
     * the unsigned hexadecimal representation of the hash code of the
     * object. In other words, this method returns a string equal to the
     * value of:
     * <blockquote>
     * <pre>
     * getClass().getName() + '@' + Integer.toHexString(hashCode())
     * </pre></blockquote>
     *
     * @return a string representation of the object.
     */
    public String toString()
    {
        if (data != null)
        {
            int len = Math.min(150, data.toString().length());
            return "Message[type:" + type + ",version:" + version + ",scope:" + scope + ",data-length:" + len + ",data:" + data + ",sender:" + this.user + "]";
        }
        else
        {
            return "Message[type:" + type + ",version:" + version + ",scope:" + scope + ",data-length:0,data:<null>,sender:" + this.user + "]";
        }
    }

    /**
     * get the user originating this message
     *
     * @return user
     */
    public Principal getUser()
    {
        return user;
    }

    /**
     * set the user originating this message
     *
     * @param user originating user
     */
    public void setUser(Principal user)
    {
        this.user = user;
    }

    /**
     * get the timestamp this message was sent
     *
     * @return message timestamp
     */
    public long getTimestamp()
    {
        return this.timestamp;
    }
    /**
     * set the timestamp for the time this message was sent
     *
     * @return message timestamp
     */
    public void setTimestamp(Long timestamp)
    {
        this.timestamp = timestamp;
    }

    /**
     * get the data payload associated with this message
     *
     * @return data payload
     */
    public IMessageDataObject getData()
    {
        return this.data;
    }

    /**
     * set the data payload associated with this message
     *
     * @param data data payload
     */
    public void setData(IMessageDataObject data)
    {
        this.data = data;
    }

    /**
     * get the type of the data payload attached to this message
     *
     * @return message data payload type
     */
    public String getType()
    {
        return this.type;
    }

    /**
     * set the type of the data payload attached to this message
     *
     * @param type message data payload type
     */
    public void setType(String type)
    {
        this.type = type;
    }

    public String getScope()
    {
        return scope;
    }

    public void setScope(String scope)
    {
        this.scope = scope;
    }

    public InetAddress getAddress()
    {
        return address;
    }

    public void setAddress(InetAddress address)
    {
        this.address = address;
    }

    public String getVersion()
    {
        return version;
    }

    public void setVersion(String version)
    {
        this.version = version;
    }

    /**
     * @return the servletRequest
     */
    public ServletRequest getServletRequest()
    {
        return servletRequest;
    }

    /**
     * @param servletRequest the servletRequest to set
     */
    public void setServletRequest(ServletRequest servletRequest)
    {
        this.servletRequest = servletRequest;
    }
}
