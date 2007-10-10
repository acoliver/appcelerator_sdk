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
package org.appcelerator.myappcelerator;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.LifecycleDestructionAware;
import org.appcelerator.annotation.LifecycleInitializationAware;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;

/**
 * TestService
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class TestService
{
    private static final Logger LOG = Logger.getLogger(TestService.class);
    
    /**
     * incoming message type
     */
    private static final String TEST_MESSAGE_REQUEST = "app.test.message.request";
    
    /**
     * response message type
     */
    private static final String TEST_MESSAGE_RESPONSE = "app.test.message";
    
    @LifecycleInitializationAware
    protected void start ()
    {
        LOG.info("started");
    }
    
    @LifecycleDestructionAware
    protected void stop ()
    {
        LOG.info("stopped");
    }
    
    /**
     * method will be invoked when the message
     * <tt>app.test.message.request</tt> is received and will return the message 
     * <tt>app.test.message</tt>
     * 
     * @param message
     * @param request
     * @param response
     * @throws Exception
     */
    @Service(request = TEST_MESSAGE_REQUEST, response = TEST_MESSAGE_RESPONSE, version = "1.0", authenticationRequired = false)
    protected void processTest (Message request, Message response)
        throws Exception
    {
        String msg = request.getData().getString("message");
        response.getData().put("message", "I received from you: "+msg);
    }

    /**
     * method will be invoked when the message
     * <tt>app.test.message.request</tt> is received and will return the message 
     * <tt>app.test.message</tt>
     * 
     * @param message
     * @param request
     * @param response
     * @throws Exception
     */
    @Service(request = TEST_MESSAGE_REQUEST, response = TEST_MESSAGE_RESPONSE, version = "2.0", authenticationRequired = false)
    protected void processTest2 (Message request, Message response)
        throws Exception
    {
        String msg = request.getData().getString("message");
        response.getData().put("message", "Message was: "+msg);
    }
}
