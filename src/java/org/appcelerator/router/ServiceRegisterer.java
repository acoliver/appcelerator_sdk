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

import java.net.InetAddress;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.LifecycleDestructionAware;
import org.appcelerator.annotation.LifecycleInitializationAware;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataObjectException;
import org.appcelerator.messaging.MessageDataType;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.threading.GlobalThreadPool;
import org.appcelerator.util.ServerID;
import org.appcelerator.util.Util;

/**
 * Service that maintains a registry of local services
 * 
 * @author Jeff Haynie
 */
public class ServiceRegisterer
{
    private static final Logger LOG = Logger.getLogger(ServiceRegisterer.class);
    
    private URL location;
    private IMessageDataList<IMessageDataObject> services = MessageUtils.createMessageDataObjectList();
    private List<ServiceClient> routers = new ArrayList<ServiceClient>();
    private String sharedSecret;
    
    public void setSharedSecret(String sharedSecret)
    {
        this.sharedSecret = Util.calcMD5(sharedSecret);
    }
    
    public void setRouters (List<URL> r)
    {
        for (URL url : r)
        {
            routers.add(new ServiceClient(url,sharedSecret));
        }
    }
    
    private Message createServicesMessage (String type) throws Exception
    {
        return createServicesMessage(new Message(),type);
    }
    
    private Message createServicesMessage (Message request,String type) throws Exception
    {
        request.setAddress(InetAddress.getLocalHost());
        request.setDataType(MessageDataType.JSON);
        request.setType(type);
        request.setDirection(MessageDirection.OUTGOING);
        request.setRequestid(String.valueOf(System.currentTimeMillis()));
        if (request.getInstanceid()==null)
        {
            request.setInstanceid(ServerID.getServerID());
        }
        if (request.getScope()==null)
        {
            request.setScope("appcelerator");
        }
        if (request.getVersion()==null)
        {
            request.setVersion("1.0");
        }
        request.setSentTimestamp(System.currentTimeMillis());
        return request;
    }
    
    
    @LifecycleInitializationAware
    public void start () throws Exception
    {
        if (null!=routers && !routers.isEmpty())
        {
            final Message request = createServicesMessage(ServiceConstants.SERVICE_ROUTER_REGISTER);
            GlobalThreadPool.get().addTask(new Runnable()
            {
                public void run ()
                {
                    request.setData(MessageUtils.createMessageDataObject().put("services", services).put("url", location));
                    // send registration to each router for all our services
                    for (ServiceClient client : routers)
                    {
                        try
                        {
                            LOG.info("registering our server: "+location+" with router: "+client.getUrl());
                            client.route(request);
                        }
                        catch (Exception ex)
                        {
                            LOG.error("error registering services with "+client,ex);
                        }
                    }
                }
            });
        }
    }
    
    @LifecycleDestructionAware
    public void stop () throws Exception
    {
        if (null!=routers && !routers.isEmpty())
        {
            // send de-registration to each router for all our services
            final Message request = createServicesMessage(ServiceConstants.SERVICE_ROUTER_UNREGISTER);
            GlobalThreadPool.get().addTask(new Runnable()
            {
                public void run ()
                {
                    // send registration to each router for all our services
                    for (ServiceClient client : routers)
                    {
                        try
                        {
                            LOG.info("un-registering our server with router at "+client.getUrl());
                            client.route(request);
                        }
                        catch (Exception ex)
                        {
                            LOG.error("error un-registering services with "+client,ex);
                        }
                    }
                }
            });
        }
    }
    
    @Service (request=ServiceConstants.SERVICE_REGISTRY_ADD, authenticationRequired=false)
    protected void registerService (Message message) throws MessageDataObjectException
    {
        //
        // this is sanity checking to only look at our messages for our server
        //
        if (message.getInstanceid().equals(ServerID.getServerID()))
        {
            IMessageDataList<IMessageDataObject> s = message.getData().getObjectArray("services");
            for (IMessageDataObject obj : s)
            {
                boolean found = false;
                String type = obj.getString("type");
                for (IMessageDataObject x : services)
                {
                    if (x.getString("type").equals(type))
                    {
                        found = true;
                        break;
                    }
                }
                if (!found)
                {
                    if (LOG.isDebugEnabled()) LOG.debug("adding "+type+" for remote registration");
                    services.add(obj);
                }
            }
        }
    }
    
    @Service (request=ServiceConstants.SERVICE_REGISTRY_REMOVE, authenticationRequired=false)
    protected void unregisterService (Message message) throws MessageDataObjectException
    {
        //
        // this is sanity checking to only look at our messages for our server
        //
        if (message.getInstanceid().equals(ServerID.getServerID()))
        {
            IMessageDataList<IMessageDataObject> s = message.getData().getObjectArray("services");
            for (IMessageDataObject obj : s)
            {
                String type = obj.getString("type");
                for (IMessageDataObject x : services)
                {
                    if (x.getString("type").equals(type))
                    {
                        services.remove(obj);
                        break;
                    }
                }
            }
        }
    }
    @Service (request=ServiceConstants.SERVICE_REGISTRY_QUERY_REQUEST, response=ServiceConstants.SERVICE_REGISTRY_QUERY_RESPONSE, authenticationRequired=false)
    protected void queryServices (Message request, Message response) throws Exception
    {
        createServicesMessage(response,ServiceConstants.SERVICE_REGISTRY_QUERY_RESPONSE);
        response.setData(MessageUtils.createMessageDataObject().put("services", services).put("url", location));
    }

    public URL getLocation()
    {
        return location;
    }

    public void setLocation(URL location)
    {
        this.location = location;
    }
}
