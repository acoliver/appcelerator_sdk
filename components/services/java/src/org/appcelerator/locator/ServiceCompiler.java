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
