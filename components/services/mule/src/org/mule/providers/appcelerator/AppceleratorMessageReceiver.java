/*
 * $Id: FileMessageReceiver.java 7976 2007-08-21 14:26:13Z dirk.olmes $
 * --------------------------------------------------------------------------------------
 * Copyright (c) MuleSource, Inc.  All rights reserved.  http://www.mulesource.com
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */

package org.mule.providers.appcelerator;

import java.net.URI;

import net.sf.json.JSONObject;

import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.service.ServiceRegistry;
import org.mule.config.i18n.MessageFactory;
import org.mule.impl.MuleMessage;
import org.mule.providers.AbstractMessageReceiver;
import org.mule.umo.UMOComponent;
import org.mule.umo.UMOException;
import org.mule.umo.UMOMessage;
import org.mule.umo.endpoint.UMOEndpoint;
import org.mule.umo.lifecycle.InitialisationException;
import org.mule.umo.provider.UMOConnector;
import org.mule.umo.provider.UMOMessageAdapter;
import org.mule.umo.routing.RoutingException;


public class AppceleratorMessageReceiver extends AbstractMessageReceiver
{

    private AppceleratorMessageReceiverAdapter adapter;

    public AppceleratorMessageReceiver(UMOConnector connector,
                               UMOComponent component,
                               UMOEndpoint endpoint) throws InitialisationException
    {
        super(connector, component, endpoint);
        
        URI uri = endpoint.getEndpointURI().getUri();
        
        String messages[] = uri.getUserInfo().split(":");
        if (messages.length < 2) {
            throw new org.mule.providers.ConnectException(MessageFactory.createStaticMessage("Could not parse request and response message from URI"), this);
        }
        
        String version = uri.getPath().replace("/", "");
        if (version.equals(""))
            version = "1.0";
        
        String request = messages[0];
        String response = messages[1];
        adapter = new AppceleratorMessageReceiverAdapter(request, response, version, this);
        //this.host = uri.getHost();

        try {
            ServiceRegistry.registerService(adapter, true);
        } catch (Exception e) {
            throw new org.mule.providers.ConnectException(MessageFactory.createStaticMessage("Could not register Appcelerator service with ServiceRegistry: " + e), this);
        }

    }
    
    @Override
    protected void doConnect() throws Exception
    {
        //ServiceRegistry.registerService(adapter, true);
    }

    @Override
    protected void doDisconnect() throws Exception
    {
        // not necessary
    }

    @Override
    protected void doDispose()
    {
        // not necessary
    }

    @Override
    protected void doStart() throws UMOException {
        // not necessary
    }

    @Override
    protected void doStop() throws UMOException {
        // not necessary
    }

    public void dispatch(Message request, Message response) {
        
        UMOMessageAdapter msgAdapter;

        try {
            msgAdapter = connector.getMessageAdapter(((Object) new Object[] {request, response}));

        }
        catch (Exception e)
        {
            logger.error("Could not create message adapter: ", e);
            return;
        }
        
        try { 
            
            // appcelerator messages are always synchronous for now
            UMOMessage responseMessage  = this.routeMessage(new MuleMessage(msgAdapter), true);
            
            JSONObject o = JSONObject.fromObject(responseMessage.getPayloadAsString());
            JSONMessageDataObject jmdo = new JSONMessageDataObject(o);
            response.setData(jmdo);
        }
        catch (Exception e)
        {
            Exception ex = new RoutingException(MessageFactory.createStaticMessage("Exception while processing " + request.getType()), new MuleMessage(msgAdapter), endpoint, e);
            this.handleException(ex);
            return;
        }
    }

}
