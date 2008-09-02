
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

package org.appcelerator.dispatcher;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;

/**
 * Simple EchoService example
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class TestService
{
	private final Log LOG = LogFactory.getLog(TestService.class);
	public TestService() {
		LOG.info("created TestService");
	}
	private String simpleProperty = null;
    @Service(request = "simple.request", response = "simple.response", version = "1.0")
    protected void processTest (Message request, Message response)
        throws Exception
    {
    	response.getData().put("simpleProperty", simpleProperty);
    }
	public String getSimpleProperty() {
		return simpleProperty;
	}
	public void setSimpleProperty(String simpleProperty) {
		this.simpleProperty = simpleProperty;
	}
    
}
