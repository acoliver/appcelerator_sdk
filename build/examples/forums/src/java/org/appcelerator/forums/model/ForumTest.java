package org.appcelerator.forums.model;

import junit.framework.TestCase;

import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;

public class ForumTest extends TestCase {
	public void testIt() {
		User user = new User();
		user.setEmail("email");
		user.setFullName("ante wew");
		user.setId(new Long(0));
		user.setPassword("pwd");
		user.setPosts(new Long(0));
		user.setState("mystate");
		user.setThreads(new Long(0));
		user.setUsername("azuercher");
		Message message = new Message();
		JSONMessageDataObject data = new JSONMessageDataObject();
		message.setData(data);
		message.getData().put("user", user);
		message.getData().put("count", 1);
		String messagestr = data.toDataString();
		assertNotNull(messagestr);
	}
}
