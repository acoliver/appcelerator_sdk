package org.appcelerator.dispatcher;

import java.util.List;

import org.appcelerator.messaging.Message;

public interface DispatchVisitor {
	public Object startVisit(Message request, List<Message> responses);
	public void endVisit(Object obj, Message request, List<Message> responses);
}
