package org.appcelerator.stats;

import org.appcelerator.messaging.Message;


public class NullPerformanceManager implements PerformanceManager{
	public void publish(Statistic stat) {
		//squash
	}
	public Statistic createStat(Message mesage) {
		return null;
	}

}
