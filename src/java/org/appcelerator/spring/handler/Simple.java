package org.appcelerator.spring.handler;

import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataObjectException;

public class Simple {
	public void hello(Message request, Message response) throws MessageDataObjectException
	{
		response.getData().put("success", "true");
		response.getData().put("message", "you sent "+request.getData().getString("message"));
	}
}
