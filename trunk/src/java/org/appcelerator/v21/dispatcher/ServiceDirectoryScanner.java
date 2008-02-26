/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
package org.appcelerator.v21.dispatcher;

import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javassist.ClassPool;
import javassist.CtClass;

import org.apache.log4j.Logger;


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
    private static final Logger LOG = Logger.getLogger(ServiceDirectoryScanner.class);
    
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
            File files[]=serviceDirectory.listFiles(new FilenameFilter()
            {
                public boolean accept(File dir, String name)
                {
                    return name.endsWith(".java");
                }
            });
            
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
                        entry = new Entry(file);
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
                        ServiceRegistry.unregisterService(a);
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
    
    
    private static final class Entry
    {
        File sourceFile;
        File compiledFile;
        long modified;
        int count = 1;
        boolean errored;
        List<ServiceAdapter> registrations=new ArrayList<ServiceAdapter>();
        
        Entry (File file) throws Exception
        {
            this.sourceFile = file;
            this.modified=sourceFile.lastModified();
            this.compiledFile = new File(file.getParentFile(), file.getName().replace(".java", ".class"));
            compile();
        }
        
        public boolean requiresCompilation ()
        {
            return sourceFile.lastModified()!=modified || !this.compiledFile.exists();
        }
        
        public void compile() throws Exception
        {
            System.err.println("calling compile on "+sourceFile);
            if (ServiceCompiler.compileJava(sourceFile, compiledFile.getParentFile(),new PrintWriter(System.err)))
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
                    ServiceRegistry.unregisterService(a);
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
                ServiceRegistry.registerServiceMethods(clz,true,registrations);
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
