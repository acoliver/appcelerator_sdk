package org.appcelerator.test;

import junit.framework.TestCase;

import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataObjectException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class TestManagerImplTest extends TestCase {
	public void testMonitor() throws Exception {
		ApplicationContext context = new ClassPathXmlApplicationContext("org/appcelerator/test/spring-beans.xml");
		TestManagerImpl manager = (TestManagerImpl)context.getBean("testManager");
		
		long id = create(manager, "my tester");
		update(manager, id);

		long id2 = create(manager,"another test");
		update(manager, id2);
		long id3 = create(manager,"yet test");
		update(manager, id3);
		long id4 = create(manager,"yet test");
		update(manager, id4);
		
		
		JSONMessageDataObject getresponse = new JSONMessageDataObject();
		manager.get(null, createMessage(null, getresponse));
        System.out.println(getresponse.toDataString());


	}
	private void update(TestManagerImpl manager, long id) throws Exception {
		JSONMessageDataObject requestupdate = new JSONMessageDataObject();
		JSONMessageDataObject responseupdate = new JSONMessageDataObject();
		requestupdate.put("id", id);
		requestupdate.put("status", "Completed");
		requestupdate.put("details", "tis all good");
		manager.update(createMessage(null, requestupdate), createMessage(null, responseupdate));
        System.out.println(responseupdate.toDataString());
	}
	private long create(TestManagerImpl manager, String type) throws Exception,
			MessageDataObjectException {
		JSONMessageDataObject request = new JSONMessageDataObject();
		JSONMessageDataObject response = new JSONMessageDataObject();
		request.put("type", type);
		request.put("details", "user agent info");
		manager.create(createMessage(null, request), createMessage(null, response));
        System.out.println(response.toDataString());
        long id = response.getObject("test").getLong("id");
		return id;
	}
	private Message createMessage(String type, JSONMessageDataObject data) {
		Message message = new Message();
		message.setType(type);
		message.setData(data);
		return message;
	}

}
