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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.concurrent.FutureTask;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.annotation.LifecycleDestructionAware;
import org.appcelerator.annotation.LifecycleInitializationAware;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.IServiceBroker;
import org.appcelerator.messaging.IServiceListener;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.util.Util;


public class ServiceRouter implements IServiceListener
{
    private static final Logger LOG = Logger.getLogger(ServiceRouter.class);
    
    private final Map<URL,ServiceClient> serverMap = Collections.synchronizedMap(new HashMap<URL,ServiceClient>());
    private final Map<String,SortedSet<ServiceClient>> serviceMap = Collections.synchronizedMap(new HashMap<String,SortedSet<ServiceClient>>());
    
    @InjectBean
    private IServiceBroker serviceBroker;
    
    private String sharedSecret;
    
    public void setSharedSecret(String sharedSecret)
    {
        this.sharedSecret = Util.calcMD5(sharedSecret);
    }

    @LifecycleInitializationAware
    public void start() 
    {
        serviceBroker.registerListener(this);
    }
    
    @LifecycleDestructionAware
    public void destroy ()
    {
        serviceBroker.unregisterListener(this);
    }
    
    @Service(request=ServiceConstants.SERVICE_ROUTER_REGISTER,authenticationRequired=false)
    protected void registerServices (Message request) throws Exception
    {
        if (LOG.isDebugEnabled()) LOG.debug("service router register = "+request);
        
        IMessageDataObject data = request.getData();
        URL url = new URL(data.getString("url"));
        ServiceClient server = serverMap.get(url);
        if (server==null)
        {
            server = new ServiceClient(url,sharedSecret);
            serverMap.put(url,server);
        }
        IMessageDataList<IMessageDataObject> services = data.getObjectArray("services");
        for (IMessageDataObject service : services)
        {
            String type = service.getString("type");
            SortedSet<ServiceClient> servers = serviceMap.get(type);
            if (servers == null)
            {
                servers = new TreeSet<ServiceClient>();
                serviceMap.put(type,servers);
            }
            servers.add(server);
            LOG.info("registering "+type+" => "+server);
        }
    }

    @Service(request=ServiceConstants.SERVICE_ROUTER_UNREGISTER,authenticationRequired=false)
    protected void unregisterServices (Message request) throws Exception
    {
        if (LOG.isDebugEnabled()) LOG.debug("service router unregister = "+request);

        IMessageDataObject data = request.getData();
        URL url = new URL(data.getString("url"));
        ServiceClient server = serverMap.remove(url);
        IMessageDataList<IMessageDataObject> services = data.getObjectArray("services");
        for (IMessageDataObject service : services)
        {
            String type = service.getString("type");
            SortedSet<ServiceClient> servers = serviceMap.get(type);
            if (servers!=null)
            {
                serviceMap.remove(server);
                LOG.info("unregistering "+type+" => "+server);
                if (servers.isEmpty())
                {
                    serviceMap.remove(type);
                }
            }
        }
    }
    @Service(request=ServiceConstants.SERVICE_ROUTER_QUERY_SERVICES_REQUEST,response=ServiceConstants.SERVICE_ROUTER_QUERY_SERVICES_RESPONSE,authenticationRequired=false)
    protected void queryRegisteredServices (Message request, Message response) throws Exception
    {
        IMessageDataList<IMessageDataObject> services = MessageUtils.createMessageDataObjectList();
        
        for (String name : serviceMap.keySet())
        {
            SortedSet<ServiceClient> servers = serviceMap.get(name);
            IMessageDataList<IMessageDataObject> s = MessageUtils.createMessageDataObjectList();
            for (ServiceClient client : servers)
            {
                IMessageDataObject obj = MessageUtils.createMessageDataObject();
                obj.put("url", client.getUrl());
                obj.put("hitcount", client.getHitcount());
                obj.put("lasthit",client.getLasthit());
                s.add(obj);
            }
            IMessageDataObject e = MessageUtils.createMessageDataObject();
            e.put("name",name);
            e.put("servers",s);
            services.add(e);
        }
        response.getData().put("services", services).put("success", true);
    }
    @Service(request=ServiceConstants.SERVICE_ROUTER_QUERY_SERVERS_REQUEST,response=ServiceConstants.SERVICE_ROUTER_QUERY_SERVERS_RESPONSE,authenticationRequired=false)
    protected void queryRegisteredServers (Message request, Message response) throws Exception
    {
        //TODO: send back servers and which types they support
    }
        
    public boolean accept(Message message)
    {
        if (serverMap.isEmpty())
        {
            return false;
        }
        
        // only route incoming messages and ignore service registration messages
        return message.getAddress()!=null && message.getDirection().equals(MessageDirection.INCOMING) && 
               false == message.getType().startsWith(ServiceConstants.SERVICE_PREFIX);
    }

    public List<String> getServiceTypes()
    {
        return null;
    }

    public void onMessage(Message message)
    {
        String type = message.getType();
        SortedSet<ServiceClient> servers = serviceMap.get(type);
        if (servers!=null && !servers.isEmpty())
        {
            int attempts = 0;
            ServiceClient server = null;
            while ( attempts++ < 3 )
            {
                server = servers.first();
                try
                {
                    IServiceBroker broker = message.getBroker();
                    List<Message> responses = server.route(message);
                    if (false==responses.isEmpty())
                    {
                        for (Message response : responses)
                        {
                           response.setDirection(MessageDirection.OUTGOING);
                           FutureTask<Runnable> future=new FutureTask<Runnable>(new Runnable(){public void run (){}},null);
                           broker.dispatch(response, future);
                           future.get();
                        }
                    }
                    break;
                }
                catch (Exception e)
                {
                    LOG.error("Error routing: "+message+" to: "+server,e);
                }
            }
        }
    }
}
