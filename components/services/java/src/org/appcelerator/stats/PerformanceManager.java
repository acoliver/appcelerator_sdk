package org.appcelerator.stats;

import org.appcelerator.messaging.Message;



public interface PerformanceManager {
	public void publish(Statistic stat);
	public Statistic createStat(Message mesage);
}
