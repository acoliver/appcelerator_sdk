
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

package org.appcelerator.test;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;

/**
 * Simple EchoService example
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class EchoService
{
    private static final Log LOG = LogFactory.getLog(EchoService.class);
    
    /**
     * incoming message type
     */
    private static final String TEST_MESSAGE_REQUEST = "app.test.message.request";
    
    /**
     * response message type
     */
    private static final String TEST_MESSAGE_RESPONSE = "app.test.message.response";

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
    @Service(request = TEST_MESSAGE_REQUEST, response = TEST_MESSAGE_RESPONSE, version = "1.0")
    protected void processTest (Message request, Message response)
        throws Exception
    {
		LOG.debug("received: "+request);
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
    @Service(request = TEST_MESSAGE_REQUEST, response = TEST_MESSAGE_RESPONSE, version = "2.0")
    protected void processTest2 (Message request, Message response)
        throws Exception
    {
		LOG.debug("received: "+request);
        String msg = request.getData().getString("message");
        response.getData().put("message", "Message was: "+msg);
    }

}
