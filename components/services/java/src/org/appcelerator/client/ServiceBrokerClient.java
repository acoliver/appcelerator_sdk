/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.appcelerator.client;
    
import java.io.InputStream;
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
 * Pure Java implementation of ServiceBroker client
 * 
 * @author Jeff Haynie
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

        public void setUrl( URL url )
        {
        	this.url = url;
		this.connected = false;
        }

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
	
	private String suck (InputStream in) throws Exception
	{
		byte buf [] = new byte[4096];
		StringBuilder str = new StringBuilder();
		while ( true )
		{
			int c = in.read(buf);
			if (c < 0)
			{
				break;
			}
			str.append(new String(buf,0,c));
		}
		return str.toString();
	}
	
	private void connect () throws Exception
	{
		URL u = new URL(url.toExternalForm()+"appcelerator.xml");
		HttpURLConnection http = (HttpURLConnection)u.openConnection();
		http.connect();
		String result = suck(http.getInputStream());
		
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
		connected = true;
	}

	public void run()
	{
		try {
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
