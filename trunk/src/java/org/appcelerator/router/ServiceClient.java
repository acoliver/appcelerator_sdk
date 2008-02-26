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
package org.appcelerator.router;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.methods.ByteArrayRequestEntity;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.apache.log4j.Logger;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataType;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.threading.GlobalThreadPool;
import org.appcelerator.util.ServerID;
import org.appcelerator.util.Util;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * a client which sends and receives a message from a Appcelerator Server
 */
public class ServiceClient implements Comparable<ServiceClient>
{
    private static final Logger LOG = Logger.getLogger(ServiceClient.class);
    
    private final URL url;
    private final String sharedSecret;
    private long hitcount=0;
    private long lasthit=0;
    private HttpState state = new HttpState();
    private HttpClient client = new HttpClient();
    
    public ServiceClient (URL url, String sharedSecret)
    {
        this.url = url;
        this.sharedSecret = sharedSecret;
        client.setState(state);
    }
    
    public String toString ()
    {
        return "ServiceClient["+url+"]";
    }
    
    public long getHitcount()
    {
        return hitcount;
    }

    public long getLasthit()
    {
        return lasthit;
    }

    public URL getUrl()
    {
        return url;
    }

    public List<Message> route (Message request) throws Exception 
    {
        FutureTask<List<Message>> future = new FutureTask<List<Message>>(new Request(request));
        
        GlobalThreadPool.get().execute(future);
        
        //
        // update stats
        //
        this.hitcount++;
        this.lasthit = System.currentTimeMillis();
        
        return future.get();
    }
    
    private final class Request implements Callable<List<Message>>
    {
        private final Message request;
        
        Request (Message r)
        {
            this.request = r;
        }
        
        public List<Message> call () throws Exception
        {
            // simulate the server forming the authentication and pass-through
            String urlpath = url.toExternalForm();
            String auth = sharedSecret;
            long ts = request.getSentTimestamp();
            if (ts<=0)
            {
                ts = System.currentTimeMillis();
                request.setSentTimestamp(ts);
            }
            request.setTimezoneOffset(MessageUtils.getTimezoneOffset());
    
            String qs = "?instanceid="+request.getInstanceid()+"&auth="+auth+"&ts="+ts;
            URL url = new URL(urlpath+qs);
            
            if (LOG.isDebugEnabled())
            {
                LOG.debug("sending "+request+" to "+url);
            }
            
            Document xml = MessageUtils.createMessageXML(request.getSessionid(), request.getInstanceid());
            MessageUtils.toXML(request, xml.getDocumentElement());
            String xmlstring = Util.serialize(xml);
            
            PostMethod post = new PostMethod(url.toExternalForm());
            post.setRequestHeader("Content-Type", "application/xml");
            RequestEntity body = new ByteArrayRequestEntity(xmlstring.getBytes());
            post.setRequestEntity(body);

            ArrayList<Message> response = new ArrayList<Message>();
            try
            {
                int statuscode = client.executeMethod(post);
                
                if (LOG.isDebugEnabled())
                {
                    LOG.debug("client request returned : "+statuscode+" for "+xmlstring);
                }
                
                if (statuscode == 202)
                {
                    // no content in response
                }
                else if (statuscode == 200)
                {
                    Document responseXML = Util.parse(post.getResponseBodyAsStream());
                    NodeList nodes = responseXML.getDocumentElement().getChildNodes();
                    
                    for (int c=0;c<nodes.getLength();c++)
                    {
                        Node node = nodes.item(c);
                        if (node.getNodeType() == Node.ELEMENT_NODE)
                        {
                            Message msg = MessageUtils.fromXML((Element)node,request.getUser());
                            msg.setDirection(MessageDirection.INCOMING);
                            msg.setSessionid(request.getSessionid());
                            msg.setSession(request.getSession());
                            msg.setBroker(request.getBroker());
                            msg.setInstanceid(request.getInstanceid());
                            response.add(msg);
                        }
                    }
                }
            }
            finally
            {
                post.releaseConnection();
            }
            return response;
        }
    }
    public int compareTo(ServiceClient o)
    {
        long myhitcount = getHitcount();
        long hishitcount = o.getHitcount();
        
        if (myhitcount < hishitcount)
        {
            return -1;
        }
        else if (myhitcount > hishitcount)
        {
            return 1;
        }
        return 0;
    }

    public static void main (String args[]) throws Exception
    {
        URL url = new URL("http://localhost:8080/myappcelerator/-/servicebroker");
        PostMethod post = new PostMethod(url.toExternalForm());
        try
        {
            HttpState state = new HttpState();
            RequestEntity entity = new ByteArrayRequestEntity("".getBytes());
            post.setRequestEntity(entity);
            HttpClient httpclient = new HttpClient();
            httpclient.setState(state);
            int status = httpclient.executeMethod(post);
            System.err.println(status);
            System.err.println(post.getResponseBodyAsString());
            Cookie [] cookies = state.getCookies();
            if (cookies!=null)
            {
                for (Cookie c : cookies)
                {
                    System.err.println(c);
                }
            }
        }
        finally
        {
            post.releaseConnection();
        }
    }    
    
    public static void main2 (String args[]) throws Exception
    {
        URL url = new URL("http://localhost:8080/myappcelerator/-/servicebroker");
        ServiceClient client = new ServiceClient(url,"ABC123");
        Message request=new Message();
        request.setDataType(MessageDataType.JSON);
        request.setData(MessageUtils.createMessageDataObject());
        request.setType(ServiceConstants.SERVICE_REGISTRY_QUERY_REQUEST);
        request.setDirection(MessageDirection.OUTGOING);
        request.setVersion("1.0");
        request.setScope("appcelerator");
        request.setInstanceid(ServerID.getServerID());
        List<Message> responses = client.route(request);
        System.err.println(responses);
        System.exit(0);
    }
}