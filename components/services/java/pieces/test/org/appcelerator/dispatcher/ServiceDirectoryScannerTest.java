package org.appcelerator.dispatcher;


import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import junit.framework.TestCase;

import org.appcelerator.util.Util;

public class ServiceDirectoryScannerTest extends TestCase {
	public void testScan() throws IOException {
		File localdir = new File(".");
		String abs = localdir.getAbsolutePath();
		File srcdir = new File(localdir,"tmp/app/services/");
		srcdir.mkdirs();
		File servicedir = new File(srcdir,"org/appcelerator/test");
		servicedir.mkdirs();
		File echoservice = new File(localdir,"components/services/java/src/org/appcelerator/test/EchoService.java");

		Util.copy(echoservice, servicedir);
		ServiceDirectoryScanner scanner = new ServiceDirectoryScanner(srcdir,5000);
		ArrayList<File> files = new ArrayList<File>();
		scanner.getSourceFiles(files);
		this.assertEquals(1, files.size());
	}
}
