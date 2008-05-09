package org.appcelerator.dispatcher;


import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import junit.framework.TestCase;

import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.dispatcher.ServiceAnnotationDispatcher;
import org.appcelerator.dispatcher.ServiceDispatcherManager;
import org.appcelerator.dispatcher.SpringBeanDispatcher;
import org.appcelerator.messaging.Message;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class ServiceDispatcherManagerTest extends TestCase {
	public void testDispatchVisitor() throws Exception {
		
		ApplicationContext context = new ClassPathXmlApplicationContext("/org/appcelerator/dispatcher/springTest.xml");
		Message request = new Message();
		request.setType("loggedvisitor.request");
		request.setVersion("1.0");
		List<Message> responses = new LinkedList<Message>();
		AnnotationHelper.initializeAnnotationDBFromClasspath();
		Class[] dispatchers = new Class[]{ServiceAnnotationDispatcher.class,SpringBeanDispatcher.class};
		ServiceDispatcherManager.intialize(dispatchers);
		ServiceDispatcherManager.dispatch(request, responses);
		int count = responses.get(0).getData().getInt("visitCount");
		assertEquals(count,1);
		
	}
	public void testSpringService() throws Exception {
		
		ApplicationContext context = new ClassPathXmlApplicationContext("/org/appcelerator/dispatcher/springTest.xml");
		Message request = new Message();
		request.setType("simple.request");
		request.setVersion("1.0");
		List<Message> responses = new LinkedList<Message>();
		AnnotationHelper.initializeAnnotationDBFromClasspath();
		Class[] dispatchers = new Class[]{ServiceAnnotationDispatcher.class,SpringBeanDispatcher.class};
		ServiceDispatcherManager.intialize(dispatchers);
		ServiceDispatcherManager.dispatch(request, responses);
		Set<ServiceAdapter> services = ServiceRegistry.getRegisteredServices("simple.request");
		int size = services.size();
		assertEquals(1,services.size());

		String simpleProperty = responses.get(0).getData().getString("simpleProperty");
		assertEquals(simpleProperty,"foo");

		
	}
}
