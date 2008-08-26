/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
package org.appcelerator.test;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Service;
import org.appcelerator.annotation.ServiceProperty;
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
	 * incoming message type
	 */
	private static final String TEST_BEAN_MESSAGE_REQUEST = "app.test.bean.message.request";

	/**
	 * response message type
	 */
	private static final String TEST_BEAN_MESSAGE_RESPONSE = "app.test.bean.message.response";
    
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

    /**
     * method will be invoked when the message
     * <tt>app.test.bean.message.request</tt> is received and will return the message 
     * <tt>app.test.bean.message</tt>
     * 
     * @param message
     * @param request
     * @param response
     * @throws Exception
     */
    @Service(request = TEST_BEAN_MESSAGE_REQUEST, response = TEST_BEAN_MESSAGE_RESPONSE, version = "1.0")
    protected Bar processTest (Foo foo)
        throws Exception
    {
		Bar bar = new Bar();
		bar.setBar(foo.getFoo());
		return bar;
    }

    /**
     * method will be invoked when the message
     * <tt>app.test.bean.message.request</tt> is received and will return the message 
     * <tt>app.test.bean.message</tt>
     * 
     * @param message
     * @param request
     * @param response
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Service(request = TEST_BEAN_MESSAGE_REQUEST, response = TEST_BEAN_MESSAGE_RESPONSE, version = "2.0")
    protected java.util.Map processTestVersion2 (@ServiceProperty(name="foo") Foo foo, @ServiceProperty(name="bar") Bar bar)
        throws Exception
    {
		java.util.Map<String,String> map = new java.util.HashMap<String,String>();
		map.put("hello","world");
		return map;
    }
}
