package org.appcelerator.stats;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Collection;

import junit.framework.TestCase;

import org.apache.commons.monitoring.Monitoring;
import org.apache.commons.monitoring.reporting.JsonRenderer;
import org.apache.commons.monitoring.reporting.Renderer;
import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.RawMessageDataList;
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

		StringWriter out = new StringWriter();
        Renderer renderer = new JsonRenderer( new PrintWriter( out ), Renderer.DEFAULT_ROLES );
		Collection monitors = Monitoring.getRepository().getMonitors();
        renderer.render( monitors );
        JSONMessageDataObject json = new JSONMessageDataObject();
        RawMessageDataList toJson = new RawMessageDataList(out.toString());
        json.put("monitors", toJson);
//        System.out.println(out.toString());
        System.out.println(json.toJSONString());
	}
	private Message createMessage(String type) {
		Message message = new Message();
		message.setType(type);
		return message;
	}

}
