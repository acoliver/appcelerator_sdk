package org.appcelerator.stats;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.appcelerator.messaging.Message;

public class LoggingPerformanceManager implements PerformanceManager{
	Logger LOG = Logger.getLogger(LoggingPerformanceManager.class);
	private Level loggingLevel = Level.DEBUG;
	public void publish(Statistic stat) {
		stat.end();
		if (LOG.isEnabledFor(loggingLevel)) {
			LOG.log(loggingLevel, stat.toString());
		}
	}
	public void setLoggingLevel(String level) {
		this.loggingLevel = Level.toLevel(level);
	}
	public Statistic createStat(Message message) {
		return new StatisticImpl(message.getType());
	}

}
