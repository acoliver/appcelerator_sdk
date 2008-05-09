/*
 * $Id: FileMessageDispatcherFactory.java 7976 2007-08-21 14:26:13Z dirk.olmes $
 * --------------------------------------------------------------------------------------
 * Copyright (c) MuleSource, Inc.  All rights reserved.  http://www.mulesource.com
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */

package org.mule.providers.appcelerator;

import org.mule.providers.AbstractMessageDispatcherFactory;
import org.mule.umo.UMOException;
import org.mule.umo.endpoint.UMOImmutableEndpoint;
import org.mule.umo.provider.UMOMessageDispatcher;

/**
 * <code>FileMessageDispatcherFactory</code> creaes a dispatcher responsible for
 * writing files to disk
 */
public class AppceleratorMessageDispatcherFactory extends AbstractMessageDispatcherFactory
{
    /** {@inheritDoc} */
    public UMOMessageDispatcher create(UMOImmutableEndpoint endpoint) throws UMOException
    {
        return new AppceleratorMessageDispatcher(endpoint);
    }

}
