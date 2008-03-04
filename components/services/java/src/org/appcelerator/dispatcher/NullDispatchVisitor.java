package org.appcelerator.dispatcher;

import java.util.List;

import org.appcelerator.messaging.Message;

public class NullDispatchVisitor implements DispatchVisitor{
	public void endVisit(Object obj, Message request, List<Message> responses) 
	{
	}
	public Object startVisit(Message request, List<Message> responses) 
	{
		return null;
	}
}
