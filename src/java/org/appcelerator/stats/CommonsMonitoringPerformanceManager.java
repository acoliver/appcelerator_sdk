package org.appcelerator.stats;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Collection;

import org.apache.commons.monitoring.Monitoring;
import org.apache.commons.monitoring.Repository;
import org.apache.commons.monitoring.impl.DefaultRepository;
import org.apache.commons.monitoring.reporting.JsonRenderer;
import org.apache.commons.monitoring.reporting.Renderer;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.RawMessageDataList;

public class CommonsMonitoringPerformanceManager implements PerformanceManager {

	public CommonsMonitoringPerformanceManager() {
		setRepository(new DefaultRepository());
	}
	public Statistic createStat(Message message) {
		return new StopWatchStatistic(Monitoring.start(message.getType()),message.getType());
	}

	public void publish(Statistic stat) {
		stat.end();
	}
	public Repository getRepository() {
		return Monitoring.getRepository();
	}

	public void setRepository(Repository repository) {
		Monitoring.setRepository(repository);
	}
	@Service(request = "monitor.performance.request", response = "monitor.performance.response", authenticationRequired = false)
    protected void monitor (Message request, Message response) {
		StringWriter out = new StringWriter();
        Renderer renderer = new JsonRenderer( new PrintWriter( out ), Renderer.DEFAULT_ROLES );
		Collection monitors = Monitoring.getRepository().getMonitors();
        renderer.render( monitors );
        RawMessageDataList toJson = new RawMessageDataList(out.toString());
        response.getData().put("monitors", toJson);
        response.getData().put("success", true);
    }
	@Service(request = "reset.performance.request", response = "reset.performance.response", authenticationRequired = false)
	protected void reset (Message request, Message response) {
    	Monitoring.getRepository().reset();
		response.getData().put("success", true);
    }

}
