package org.appcelerator.stats;

import junit.framework.TestCase;

import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class CommonsMonitorPerformanceManagerTest extends TestCase{
	public void testMonitor() {
		ApplicationContext context = new ClassPathXmlApplicationContext("org/appcelerator/stats/commons-spring-beans.xml");
		CommonsMonitoringPerformanceManager manager = (CommonsMonitoringPerformanceManager)context.getBean("performanceManager");
		Statistic stat1 = manager.createStat(createMessage("contacts.request"));
		Statistic stat2 = manager.createStat(createMessage("contacts.request"));
		manager.publish(stat1);
		manager.publish(stat2);

		Message response = createMessage("test");
		response.setData(new JSONMessageDataObject());
		manager.monitor(null, response);
        System.out.println(response.getData().toDataString());
	}
	public void testMonitorold() {
		ApplicationContext context = new ClassPathXmlApplicationContext("org/appcelerator/stats/commons-spring-beans.xml");
		CommonsMonitoringPerformanceManager manager = (CommonsMonitoringPerformanceManager)context.getBean("performanceManager");
		Statistic stat1 = manager.createStat(createMessage("contacts.request"));
		Statistic stat2 = manager.createStat(createMessage("contacts.request"));
		manager.publish(stat1);
		manager.publish(stat2);

		Message response = createMessage("test");
		response.setData(new JSONMessageDataObject());
		manager.monitorold(null, response);
        System.out.println(response.getData().toDataString());
	}
	private Message createMessage(String type) {
		Message message = new Message();
		message.setType(type);
		return message;
	}

}
