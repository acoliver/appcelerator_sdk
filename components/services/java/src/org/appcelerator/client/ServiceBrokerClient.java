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

package org.appcelerator.client;
    
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.util.Util;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Pure Java implementation of ServiceBroker client. For example, you can use the
 * client to send and receive service broker messages remotely:
 *
 * <code>
 *
 * URL url = new URL("http://localhost:8080/foobar");
 * ServiceBrokerClient client = new ServiceBrokerClient(url);
 * IMessageDataObject data = MessageUtils.createMessageDataObject();
 * data.put("message", "hello,world");
 * Message response = client.send("app.test.message.request",data);
 * System.err.println(response);
 *
 * </code>
 * 
 * @author Jeff Haynie <jhaynie@appcelerator.com>
 */
public class ServiceBrokerClient 
{
	private URL url;
	private boolean connected;
	private URL serviceBrokerURL;
	private String cookieName;
	private String sessionId;
	private String instanceId;
	private String authToken;
	private String auid;
	
	public ServiceBrokerClient()
	{
	}

	public ServiceBrokerClient ( URL url )
	{
		this.url = url;
	}

	/**
	 * set the root URL to the remote service broker to use 
	 */
    public void setUrl( URL url )
    {
        this.url = url;
		this.connected = false;
    }

	/**
	 * return the root URL to the remote service broker being used 
	 */
	public URL getUrl ()
	{
		return this.url;
	}

    /**
	 * disconnect from remote client
     */	
	public void disconnect ()
	{
		this.cookieName = null;
		this.sessionId = null;
		this.instanceId = null;
		this.authToken = null;
		this.auid = null;
		this.connected = false;
	}
 
	/**
	 * returns true if remotely connected or false if not
	 */
    public boolean isConnected ()
    {
		return this.connected;
	}

	/**
	 * send a remote message to connected service broker. Will automatically connect
	 * if not connected.  You can pass null as 2nd argument for data if you don't have any
	 * data payload.
	 */
	public Message send (String type, IMessageDataObject data) throws Exception
	{
		if (!connected)
		{
			connect();
		}
		
		if (data == null)
		{
			data = MessageUtils.createMessageDataObject();
		}
		 
		HttpURLConnection http = (HttpURLConnection)serviceBrokerURL.openConnection();
		
		StringBuilder payload = new StringBuilder();
		payload.append("<?xml version='1.0'?>\n");
		payload.append("<messages instanceid='"+instanceId+"' sessionid='"+sessionId+"' version='1.0' tz='-5' timestamp='"+System.currentTimeMillis()+"'>");
		payload.append("<message direction='INCOMING' requestid='"+System.currentTimeMillis()+"' type='"+type+"' datatype='JSON' scope='appcelerator' version='1.0'>");
		payload.append("<![CDATA["+data.toDataString()+"]]>");
		payload.append("</message>");
		payload.append("</messages>");
		
		http.setRequestMethod("POST");
		http.setRequestProperty("Content-Type", "text/xml;charset=UTF-8");
		http.setRequestProperty("Content-Length",String.valueOf(payload.length()));
		http.setRequestProperty("Cookie",cookieName+"="+sessionId+"; AUID="+this.auid);
		
		http.setDoOutput(true);
		http.setDoInput(true);
		OutputStream out = http.getOutputStream();
		out.write(payload.toString().getBytes());
		
		if (http.getResponseCode()==202)
		{
			return null;
		}
		
		Document respXML = Util.parse(http.getInputStream());
		Message message = MessageUtils.fromXML((Element)respXML.getDocumentElement().getFirstChild(), null);
		return message;
	}

	/**
	 * connect remotely
	 */
	private void connect () throws Exception
	{
		if (null == this.url)
		{
			throw new IllegalStateException("not yet connected");
		}

		this.connected = false;

		URL u = new URL(url.toExternalForm()+"appcelerator.xml");
		HttpURLConnection http = (HttpURLConnection)u.openConnection();
		http.connect();
		String result = Util.copyToString(http.getInputStream());
		
		Pattern pattern = Pattern.compile("<servicebroker(.*)?>(.*)</servicebroker>");
		Matcher matcher = pattern.matcher(result);
		matcher.find();
		
		String sbPathPattern = matcher.group(2);
		URL sbURL = new URL(sbPathPattern.replace("@{rootPath}",url.toExternalForm()));

		pattern = Pattern.compile("<sessionid>(.*)</sessionid>");
		matcher = pattern.matcher(result);
		matcher.find();
		
		this.cookieName = matcher.group(1);

		List<String> cookieValues = http.getHeaderFields().get("Set-Cookie");
		
		for ( String cookieValue : cookieValues )
		{
			pattern = Pattern.compile(cookieName+"=(.*?);");
			matcher = pattern.matcher(cookieValue);
			if (matcher.find())
			{
				this.sessionId = matcher.group(1);
			}
			pattern = Pattern.compile("AUID=(.*?);");
			matcher = pattern.matcher(cookieValue);
			if (matcher.find())
			{
				this.auid = matcher.group(1);
			}
		}
		
		this.instanceId = String.valueOf(System.currentTimeMillis());
		this.authToken = Util.calcMD5(this.sessionId+this.instanceId);
		
		this.serviceBrokerURL = new URL(sbURL.toExternalForm()+"?instanceid="+this.instanceId+"&auth="+this.authToken+"&ts="+System.currentTimeMillis()+"&maxwait="+Long.MAX_VALUE);
		this.connected = true;
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) 
	{
		try
		{
			URL url = new URL("http://localhost:8080/ptt_at_ajaxworld/");
			ServiceBrokerClient client = new ServiceBrokerClient();
                        client.setUrl( url );
			IMessageDataObject data = MessageUtils.createMessageDataObject();
			data.put("message", "hello,world");
			Message response = client.send("app.test.message.request",data);
			System.err.println(response);
		}
		catch (Exception ex)
		{
			ex.printStackTrace();
			System.exit(1);
		}
	}    
}
