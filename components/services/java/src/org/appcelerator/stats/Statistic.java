package org.appcelerator.stats;


public interface Statistic {
	public long getStartTime();
	public long getTime();
	public String getName();
	public void end();
}
