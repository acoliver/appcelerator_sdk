package org.appcelerator.dispatcher;

import java.util.LinkedList;
import java.util.List;

import junit.framework.TestCase;

import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;

public class PostmethodExceptionTest extends TestCase {
	public void testDispatchVisitor() throws Exception {
		Message request = new Message();
		request.setType("testexception.request");
		request.setVersion("1.0");
		List<Message> responses = new LinkedList<Message>();
		AnnotationHelper.initializeAnnotationDBFromClasspath();
		Class[] dispatchers = new Class[]{ServiceAnnotationDispatcher.class};
		ServiceDispatcherManager.intialize(dispatchers);
		ServiceDispatcherManager.dispatch(request, responses);
		IMessageDataObject response = responses.get(0).getData();
		assertEquals(response.getString("message"), "system.error");
		assertEquals(response.getBoolean("success"), false);
		assertEquals(response.getString("secondary_message"), "howdy");
	}

}
