/**
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.appcelerator.dispatcher;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javassist.ClassPool;
import javassist.CtClass;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.util.Util;

/**
 * This class is responsible for scanning a directory for Java based files which contain
 * @Service methods, compiling them into bytecode and registering those services with the 
 * {@link ServiceRegistry}.  
 * 
 * This class will automatically re-compile and re-register (and unload previously registered)
 * services on-the-fly.
 * 
 * @author Jeff Haynie
 */
public class ServiceDirectoryScanner implements Runnable
{
    private static final Log LOG = LogFactory.getLog(ServiceDirectoryScanner.class);
    
    private File serviceDirectory;
    private Thread scannerThread;
    private boolean running;
    private long scanInterval;
    private HashMap<String,Entry> services=new HashMap<String,Entry>();
    
    
    public ServiceDirectoryScanner(File directory, long scanInterval)
    {
        this.serviceDirectory = directory;
        this.scanInterval = scanInterval;
    }
    
    public void start ()
    {
        if (this.running)
        {
            throw new IllegalStateException("already running");
        }
        this.running=true;
        this.scannerThread = new Thread(this,"ServiceDirectoryScanner");
        this.scannerThread.start();
        LOG.info("Service scanner is running every " + (scanInterval/1000) + " seconds");
    }
    
    public void stop ()
    {
        if (running)
        {
            running=false;
            scannerThread.interrupt();
            try
            {
                scannerThread.join();
            }
            catch(InterruptedException e)
            {
            }
            LOG.info("Service scanner has been stopped");
        }
    }
    
    public void run ()
    {
        while(running)
        {
            ArrayList<File> files = new ArrayList<File>();
            getSourceFiles(serviceDirectory, files);

			if (files!=null && files.size() > 0)
            {
	            Set<String> current = new HashSet<String>(services.keySet());

	            for (File file : files)
	            {
	                String name = file.getName();
	                Entry entry = services.get(name);
	                if (entry==null)
	                {
	                    // new
	                    try
	                    {
	                        entry = new Entry(file,serviceDirectory);
	                        services.put(name, entry);
	                    }
	                    catch (Exception ex)
	                    {
	                        ex.printStackTrace();
	                    }
	                }
	                else
	                {
	                    // current
	                    current.remove(name);
	                }

	                if (entry.requiresCompilation())
	                {
	                    try
	                    {
	                        entry.compile();
	                    }
	                    catch (Exception ex)
	                    {
	                        ex.printStackTrace();
	                        services.remove(name);
	                    }
	                }
	            }

	            if (!current.isEmpty())
	            {
	                // not found, they have been removed and need to be
	                // removed from registery
	                for (String name : current)
	                {
	                    Entry e = services.remove(name);
	                    for (ServiceAdapter a : e.registrations)
	                    {
	                    	ServiceRegistry.getInstance().unregisterService(a);
	                    }
	                }
	            }
			}
            try
            {
                Thread.sleep(scanInterval);
            }
            catch (InterruptedException e)
            {
                break;
            }
        }
    }
	public void getSourceFiles(ArrayList<File> files) 
	{
		getSourceFiles(serviceDirectory,files);
	}
	private void getSourceFiles(File directory,ArrayList<File> result) {
		File [] files = directory.listFiles();
		for (File file : files)
		{
 			if (file.isDirectory())
 			{
 				LOG.debug("traversing "+file);
 				getSourceFiles(file,result);
 			}
 			else if (file.getName().endsWith(".java")) 
	        {
 				result.add(file);
 				LOG.debug("added "+file);
	        } 
	        else
	        {
 				LOG.debug("ignored "+file);
	        }
		}
	}
    
	private static final Pattern packagePattern = Pattern.compile("package (.*?);",Pattern.MULTILINE|Pattern.DOTALL);
	private static String findPackage(String code)
	{
		Matcher matcher = packagePattern.matcher(code);
		if (matcher.find())
		{
			return matcher.group(1);
		}
		return null;
	}
    
    private static final class Entry
    {
        File sourceFile;
        File compiledFile;
		File serviceDirectory;
        long modified;
        int count = 1;
        boolean errored;
        List<ServiceAdapter> registrations=new ArrayList<ServiceAdapter>();
        
        Entry (File file, File serviceDirectory) throws Exception
        {
            this.sourceFile = file;
			this.serviceDirectory = serviceDirectory;
            this.modified=sourceFile.lastModified();
			
			String javaCode = Util.copyToString(this.sourceFile);
            this.compiledFile = new File(file.getParentFile(), file.getName().replace(".java", ".class"));
            compile();
        }
        
        public boolean requiresCompilation ()
        {
            return sourceFile.lastModified()!=modified || !this.compiledFile.exists();
        }
        
        public void compile() throws Exception
        {
            LOG.debug ("calling compile on "+sourceFile);
            if (ServiceCompiler.compileJava(sourceFile, serviceDirectory, new PrintWriter(System.err)))
            {
                if (errored)
                {
                    System.err.println("file "+sourceFile+" is now compiled successfully without errors");
                }
                errored=false;
                load();
            }
            else
            {
                errored=true;
            }
            this.modified=sourceFile.lastModified();
        }
        
        @SuppressWarnings("unchecked")
        private void load() throws Exception
        {
            if (!registrations.isEmpty())
            {
                for (ServiceAdapter a : registrations)
                {
                	ServiceRegistry.getInstance().unregisterService(a);
                }
                
                // clear our registrations
                registrations.clear();
            }
            
            // load the file using javassist so we can manipulate it
            ClassPool pool = ClassPool.getDefault();
            InputStream in = new FileInputStream(compiledFile);
            CtClass ct = pool.makeClass(in);
            in.close();
            String name = ct.getName();
            // rename it to a unique name in the VM so we don't have
            // linkage issues (looks like a different class)
            ct.setName(name+"$"+count++);
            Class clz = ct.toClass();
            // clean up the reference from the pool
            ct.detach();
            ct=null;
            
            try
            {
            	ServiceRegistry.getInstance().registerServiceMethods(clz,true,registrations,null,"directoryScanner");
            }
            catch (Exception ex)
            {
                ex.printStackTrace();
            }
        }
    }
    
    public static void main (String args[]) throws Exception
    {
        ServiceDirectoryScanner scanner = new ServiceDirectoryScanner(new File("/Users/jhaynie/tmp/"),5000);
        scanner.start();
        Thread.sleep(60000);
        scanner.stop();
    }
}
