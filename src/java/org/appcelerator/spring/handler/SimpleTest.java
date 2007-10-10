package org.appcelerator.spring.handler;

import java.lang.reflect.InvocationTargetException;

import junit.framework.TestCase;

import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataObjectException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class SimpleTest extends TestCase {
	public void testIt() throws IllegalArgumentException, IllegalAccessException, InvocationTargetException, MessageDataObjectException {
		ApplicationContext context = new ClassPathXmlApplicationContext("org/appcelerator/spring/handler/spring-beans.xml");
		Message request = new Message();
		request.setData(new JSONMessageDataObject());
		request.getData().put("message", "hello");
		Message response = new Message(request);
		response.setData(new JSONMessageDataObject());
		ListenerBinding listener = (ListenerBinding) context.getBean("myservice");
		listener.invoke(request,response);
		
		System.out.println(response.getData().getString("message"));
	}
}
