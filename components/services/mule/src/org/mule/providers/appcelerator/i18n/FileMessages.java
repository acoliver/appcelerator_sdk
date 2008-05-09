/*
 * $Id: FileMessages.java 7976 2007-08-21 14:26:13Z dirk.olmes $
 * --------------------------------------------------------------------------------------
 * Copyright (c) MuleSource, Inc.  All rights reserved.  http://www.mulesource.com
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */

package org.mule.providers.appcelerator.i18n;

import org.mule.config.i18n.Message;
import org.mule.config.i18n.MessageFactory;
import org.mule.umo.endpoint.UMOEndpointURI;

public class FileMessages extends MessageFactory
{
    private static final String BUNDLE_PATH = getBundlePath("file");

    public static Message errorWhileListingFiles()
    {
        return createMessage(BUNDLE_PATH, 1);
    }

    public static Message exceptionWhileProcessing(String name, String string)
    {
        return createMessage(BUNDLE_PATH, 2, name, string);
    }

    public static Message failedToDeleteFile(String path)
    {
        return createMessage(BUNDLE_PATH, 3, path);
    }

    public static Message failedToMoveFile(String from, String to)
    {
        return createMessage(BUNDLE_PATH, 4, from, to);
    }

    public static Message moveToDirectoryNotWritable()
    {
        return createMessage(BUNDLE_PATH, 5);
    }

    public static Message invalidFileFilter(UMOEndpointURI endpointURI)
    {
        return createMessage(BUNDLE_PATH, 6, endpointURI);
    }

    public static Message fileDoesNotExist(String string)
    {
        return createMessage(BUNDLE_PATH, 7, string);
    }
}


