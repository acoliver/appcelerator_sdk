package org.appcelerator.test;

import java.util.Collection;

public interface TestManager {
	public Test create(String type,String details);
    public Test update(long id, String statusString, String details);
	public Collection<Test> get();
	public void reset();
}