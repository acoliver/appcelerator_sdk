
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


package org.appcelerator.locator.visitor;

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;

/**
 * simple dispatch visitor implementation which simply logs visits and provides a 
 * simple service for reporting statistics about service dispatching.
 */
public class LoggedDispatchVisitor implements DispatchVisitor
{
	private static final Log LOG = LogFactory.getLog(LoggedDispatchVisitor.class);
	private int visitCount = 0;
	
	public LoggedDispatchVisitor() 
	{
		LOG.info("LoggedDispatchVisitor created");
	}

	public void endVisit(Object obj, Message request, List<Message> responses) 
	{
	}

	public Object startVisit(Message request, List<Message> responses) 
	{
		visitCount++;
		LOG.info("visited "+visitCount);
		return null;
	}

	@Service(request = "loggedvisitor.request", response = "loggedvisitor.response")
    public void monitor (Message request, Message response) 
	{
		response.getData().put("visitCount", visitCount);
	}
}
