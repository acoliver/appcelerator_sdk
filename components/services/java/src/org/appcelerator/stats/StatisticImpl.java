package org.appcelerator.stats;


public class StatisticImpl implements Statistic {
	private long time;
	private String name;
	private long startTime;
	public StatisticImpl(String name) {
		startTime = System.currentTimeMillis();
		this.name = name;
	}
	public void end() {
		time = System.currentTimeMillis() - startTime;
	}
	public long getTime() {
		return time;
	}
	public void setTime(long time) {
		this.time = time;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public long getStartTime() {
		return startTime;
	}
	public String toString() {
		return "SimpleStatistic name=" + name + " time="+time+ "ms";
	}
}
