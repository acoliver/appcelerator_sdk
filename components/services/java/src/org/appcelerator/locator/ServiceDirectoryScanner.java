/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
package org.appcelerator.locator;

import java.io.File;
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
import org.appcelerator.service.ServiceAdapter;
import org.appcelerator.service.ServiceRegistry;

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

                    if (entry != null && entry.requiresCompilation())
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
    @SuppressWarnings("unused")
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

            //String javaCode = Util.copyToString(this.sourceFile);
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
                ServiceRegistry.registerServiceMethods(clz,true,registrations,null,"directoryScanner");
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
