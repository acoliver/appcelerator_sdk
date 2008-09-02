
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

package org.appcelerator.locator;

import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.jdt.internal.compiler.batch.Main;
import org.scannotation.ClasspathUrlFinder;

/**
 * This class is responsible for compiling services.
 */
public class ServiceCompiler
{
    private static final Log LOG = LogFactory.getLog(ServiceCompiler.class);
    
    /**
     * compile a service file written in Java
     * 
     * @param serviceFile
     * @param classDir
     */
    public static boolean compileJava (File serviceFile, File classDir, PrintWriter stderr)
    {
        if (LOG.isDebugEnabled()) LOG.debug("compiling java service file: "+serviceFile);

        classDir.mkdirs();

        URL[] urls = ClasspathUrlFinder.findClassPaths();
        StringBuilder cp=new StringBuilder();
        cp.append("\""+System.getProperty("sun.boot.class.path")+"\"");
        cp.append(File.pathSeparatorChar);
        for (URL url : urls)
        {
            cp.append("\"");
            cp.append(url.getPath());
            cp.append("\"");
            cp.append(File.pathSeparatorChar);
        }
        StringWriter errWriter=new StringWriter();
        StringBuffer buf = errWriter.getBuffer();

		// calculate the source version to use with the compiler. we support a new custom system 
		// property called java.compiler.version which can be set to specifically use a different version
		// otherwise we default to 1.5
		String ver = System.getProperty("java.compiler.version","1.5");
		
        boolean success = Main.compile("-source " + ver + " -cp "+cp+" -d "+classDir+" \""+serviceFile.getAbsolutePath()+"\"",new PrintWriter(System.out,true),new PrintWriter(errWriter,true));

        stderr.print(buf.toString());
        stderr.flush();
        
        return success;
    }
}
