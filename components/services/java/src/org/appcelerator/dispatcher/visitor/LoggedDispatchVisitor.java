package org.appcelerator.dispatcher.visitor;

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;

public class LoggedDispatchVisitor implements DispatchVisitor{
	Log LOG = LogFactory.getLog(LoggedDispatchVisitor.class);
	private int visitCount = 0;
	public LoggedDispatchVisitor() {
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
    public void monitor (Message request, Message response) {
		response.getData().put("visitCount", visitCount);
	}

}
