package org.appcelerator.dispatcher;

import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;

public class TestExceptionService {
	
	public void postMessageException(Message request, Message responseMessage, Throwable e) {
        IMessageDataObject response = responseMessage.getData();
		response.put("success", false);
		response.put("message", "system.error");
		response.put("secondary_message", e.getMessage());
	}
    @Service(request = "testexception.request", response = "testexception.response", postmessageException="postMessageException")
	public void service(Message request, Message response) throws Exception {
    	throw new Exception("howdy");
    }
}
