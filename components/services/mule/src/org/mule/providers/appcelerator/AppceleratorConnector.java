/*
 * $Id: FileConnector.java 7976 2007-08-21 14:26:13Z dirk.olmes $
 * --------------------------------------------------------------------------------------
 * Copyright (c) MuleSource, Inc.  All rights reserved.  http://www.mulesource.com
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */

package org.mule.providers.appcelerator;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.mule.providers.AbstractConnector;
import org.mule.umo.UMOComponent;
import org.mule.umo.UMOException;
import org.mule.umo.endpoint.UMOEndpoint;
import org.mule.umo.lifecycle.InitialisationException;

/**
 * <code>FileConnector</code> is used for setting up listeners on a directory and
 * for writing files to a directory. The connecotry provides support for defining
 * file output patterns and filters for receiving files.
 */

public class AppceleratorConnector extends AbstractConnector
{
    /**
     * logger used by this class
     */
    private static Log LOG = LogFactory.getLog(AppceleratorConnector.class);
    
    /*
     * (non-Javadoc)
     * 
     * @see org.mule.providers.AbstractConnector#doInitialise()
     */
    public AppceleratorConnector()
    {
    }

    protected Object getReceiverKey(UMOComponent component, UMOEndpoint endpoint)
    {
        return endpoint.getEndpointURI().getAddress();
    }


    public String getProtocol()
    {
        return "APP";
    }

    
    protected void doDispose()
    {
        try
        {
            doStop();
        }
        catch (UMOException e)
        {
            LOG.error(e.getMessage(), e);
        }
    }


    protected void doInitialise() throws InitialisationException
    {
        // template method, nothing to do
    }

    protected void doConnect() throws Exception
    {
        // template method, nothing to do
    }

    protected void doDisconnect() throws Exception
    {
        // template method, nothing to do
    }

    protected void doStart() throws UMOException
    {
        // template method, nothing to do
    }

    protected void doStop() throws UMOException
    {

    }
 
/*
    public UMOMessageAdapter getMessageAdapter(Object message) throws MessagingException
    {
        if (message == null)
        {
            throw new MessageTypeNotSupportedException(null, adapterClass);
        }
        else if (message instanceof MuleMessage)
        {
            return ((MuleMessage)message).getAdapter();
        }
        else if (message instanceof UMOMessageAdapter)
        {
            return (UMOMessageAdapter)message;
        }
        else
        {
            throw new MessageTypeNotSupportedException(message, adapterClass);
        }
    }
*/
    
}
