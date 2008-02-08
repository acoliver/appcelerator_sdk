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
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;

import org.apache.log4j.Logger;
import org.eclipse.jdt.internal.compiler.batch.Main;
import org.scannotation.ClasspathUrlFinder;

/**
 * This class is responsible for compiling services.
 */
public class ServiceCompiler
{
    private static final Logger LOG = Logger.getLogger(ServiceCompiler.class);
    
    /**
     * compile a service file written in Java
     * 
     * @param serviceFile
     * @param classDir
     */
    public static boolean compileJava (File serviceFile, File classDir, PrintWriter stderr)
    {
        if (LOG.isDebugEnabled()) LOG.debug("compiling java service file: "+serviceFile);
        
        URL[] urls = ClasspathUrlFinder.findClassPaths();
        StringBuilder cp=new StringBuilder();
        cp.append(System.getProperty("sun.boot.class.path"));
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
        Main.compile("-source 1.5 -cp "+cp+" -d "+classDir+" "+serviceFile.getAbsolutePath(),new PrintWriter(System.out,true),new PrintWriter(errWriter,true));
        stderr.print(buf.toString());
        stderr.flush();
        return buf.length() == 0;
    }
}