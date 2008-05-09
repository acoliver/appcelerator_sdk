/*
 * $Id: FileMessageDispatcher.java 7976 2007-08-21 14:26:13Z dirk.olmes $
 * --------------------------------------------------------------------------------------
 * Copyright (c) MuleSource, Inc.  All rights reserved.  http://www.mulesource.com
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */

package org.mule.providers.appcelerator;

import org.mule.impl.MuleMessage;
import org.mule.providers.AbstractMessageDispatcher;
import org.mule.umo.UMOEvent;
import org.mule.umo.UMOMessage;
import org.mule.umo.endpoint.UMOImmutableEndpoint;

/**
 * <code>FileMessageDispatcher</code> is used to read/write files to the filesystem
 */
public class AppceleratorMessageDispatcher extends AbstractMessageDispatcher
{
    @SuppressWarnings("unused")
    private final AppceleratorConnector connector;

    public AppceleratorMessageDispatcher(UMOImmutableEndpoint endpoint)
    {
        super(endpoint);
        this.connector = (AppceleratorConnector) endpoint.getConnector();
    }

    /*
     * (non-Javadoc)
     * 
     * @see org.mule.umo.provider.UMOConnectorSession#dispatch(org.mule.umo.UMOEvent)
     */
    @SuppressWarnings("unused")
    protected void doDispatch(UMOEvent event) throws Exception
    {
        Object data = event.getTransformedMessage();
        UMOMessage message = new MuleMessage(data, event.getMessage());

        // dispatching will happen here at some point
    }
    
    protected UMOMessage doReceive(long timeout) throws Exception
    {
        // at some point we can do asynchronous messaging here.
        // BUT NOT FOR NOW
        return null;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see org.mule.umo.provider.UMOConnectorSession#send(org.mule.umo.UMOEvent)
     */
    protected UMOMessage doSend(UMOEvent event) throws Exception
    {
        doDispatch(event);
        return event.getMessage();
    }

    protected void doDispose()
    {
        // no op
    }

    protected void doConnect() throws Exception
    {
        // no op
    }

    protected void doDisconnect() throws Exception
    {
        // no op
    }

}
