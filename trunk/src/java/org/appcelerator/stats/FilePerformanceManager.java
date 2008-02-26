package org.appcelerator.stats;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

import org.apache.log4j.Logger;
import org.appcelerator.messaging.Message;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;

public class FilePerformanceManager implements InitializingBean, PerformanceManager, DisposableBean{
	public static Logger LOG = Logger.getLogger(FilePerformanceManager.class);
	private String delimiter=";";
	private String filename;
	private boolean append = true;
	private boolean writeHeader = false;
	
	private PrintWriter writer;
	private boolean initialized = false;
	public FilePerformanceManager() {
		LOG.info("hello" + System.getProperties());
	}
	public void writeHeader() {
		if (writeHeader)
			writer.println("name"+delimiter+"time"+delimiter+"startTime");
		writer.flush();
	}
	public void afterPropertiesSet() throws Exception {
		init();
	}
	private void init() throws IOException {
		if (initialized)
			return;
		initialized = true;
		File file = new File(filename);
		if (!file.getParentFile().exists()) {
			file.getParentFile().mkdirs();
		}
		writer = new PrintWriter(new FileWriter(file, append));
		writeHeader();
	}
	public void publish(Statistic stat) {
		try {
			init();
		} catch (IOException e) {
			throw new RuntimeException("problem initializing performance manager",e);
		}
		stat.end();
		writer.println(stat.getName()+delimiter+stat.getTime()+delimiter+stat.getStartTime()+delimiter);
		writer.flush();
	}
	public void destroy() throws Exception {
		writer.close();
	}
	public String getDelimiter() {
		return delimiter;
	}
	public void setDelimiter(String delimiter) {
		this.delimiter = delimiter;
	}
	public String getFilename() {
		return filename;
	}
	public void setFilename(String filename) {
		this.filename = filename.replaceAll("\\$\\{app.webapp.root\\}", System.getProperty("app.webapp.root"));
	}
	public boolean isAppend() {
		return append;
	}
	public void setAppend(boolean append) {
		this.append = append;
	}
	public boolean isWriteHeader() {
		return writeHeader;
	}
	public void setWriteHeader(boolean writeHeader) {
		this.writeHeader = writeHeader;
	}
	public Statistic createStat(Message message) {
		return new StatisticImpl(message.getType());
	}
	
}
