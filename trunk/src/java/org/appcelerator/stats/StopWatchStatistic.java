package org.appcelerator.stats;

import org.apache.commons.monitoring.StopWatch;

public class StopWatchStatistic implements Statistic{
	private StopWatch stopWatch;
	private String name;
	private long startTime;
	public StopWatch getStopWatch() {
		return stopWatch;
	}

	public void setStopWatch(StopWatch stopWatch) {
		this.stopWatch = stopWatch;
	}

	public StopWatchStatistic(StopWatch stopWatch, String name) {
		this.stopWatch = stopWatch;
		this.name = name;
		this.startTime = System.currentTimeMillis();
	}

	public void end() {
		stopWatch.stop();
	}

	public String getName() {
		return name;
	}

	public long getStartTime() {
		return startTime;
	}

	public long getTime() {
		return stopWatch.getElapsedTime();
	}
}
