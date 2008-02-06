package org.appcelerator.stats;

import org.apache.commons.monitoring.Monitoring;
import org.apache.commons.monitoring.Repository;
import org.apache.commons.monitoring.impl.DefaultRepository;
import org.appcelerator.messaging.Message;

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
}
