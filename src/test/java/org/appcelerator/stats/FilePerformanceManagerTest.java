package org.appcelerator.stats;

import junit.framework.TestCase;

public class FilePerformanceManagerTest extends TestCase {
	public void testIt() {
		String filename = "${app.webapp.root}/myfile.csv";
		System.setProperty("app.webapp.root", "/Applications/apache-tomcat/webapps/myapp");
		String newname = filename.replaceAll("\\$\\{app.webapp.root\\}", System.getProperty("app.webapp.root"));
		this.assertEquals(newname, "/Applications/apache-tomcat/webapps/myapp/myfile.scv");
	}
}
