/**
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
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
