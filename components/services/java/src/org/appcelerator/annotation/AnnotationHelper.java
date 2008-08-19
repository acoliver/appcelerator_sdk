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


package org.appcelerator.annotation;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletContext;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.scannotation.AnnotationDB;
import org.scannotation.ClasspathUrlFinder;
import org.scannotation.WarUrlFinder;

/**
 * Utilities for managing and finding annotations. Uses Bill Burke's
 * super dandy Scannotation framework.
 *
 */
public class AnnotationHelper
{
    private static final Log LOG = LogFactory.getLog(AnnotationHelper.class);
    private static Map<String, Set<String>> annotationIndex;

    /**
     * seed the annotation DB
     *
     * @param urls
     */
    public static void initializeAnnotationDB (URL urls[])
    {
        try
        {
            AnnotationDB db = new AnnotationDB();
            db.scanArchives(urls);
            annotationIndex = db.getAnnotationIndex();
        }
        catch (IOException e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

	/**
	 * called to initialize annotation DB from classpath
	 */
	public static void initializeAnnotationDBFromClasspath()
	{
        initializeAnnotationDB(ClasspathUrlFinder.findClassPaths());
	}

    /**
     * initialize the annotation DB from Servlet classpath
     *
     * @param context
     */
    public static void initializeAnnotationDBFromServlet (ServletContext context)
    {
    	Set<URL> urlSet = new HashSet<URL>();
    	urlSet.addAll(Arrays.asList(WarUrlFinder.findWebInfLibClasspaths(context)));
    	urlSet.addAll(Arrays.asList(WarUrlFinder.findWebInfClassesPath(context)));

    	List<URL> validList = new ArrayList<URL>();

    	for (URL url : urlSet)
    	{
    		if (url != null && url.toString().startsWith("file")) validList.add(url);
    	}

    	initializeAnnotationDB(validList.toArray(new URL[] {}));
    }

    @SuppressWarnings("unchecked")
    public static Class<? extends Object>[] findAnnotation(Class<? extends Annotation> name)
    {
        Set<String> set = annotationIndex.get(name.getName());
        Set<Class<? extends Object>> clz = new HashSet<Class<? extends Object>>();
        if (set!=null && !set.isEmpty())
        {
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            for (String cn : set)
            {
                try
                {
                    clz.add(cl.loadClass(cn));
                }
                catch (NoClassDefFoundError ncd)
                {
                    // this should be OK, just means that we don't have dependency
                    LOG.debug("Couldn't load @"+name.getSimpleName()+" from class: "+cn+". A dependency wasn't found: "+ncd.getMessage());
                }
                catch (ClassNotFoundException e)
                {
                }
            }
        }
        return clz.toArray(new Class[clz.size()]);
    }

    public static void main (String args[]) throws Exception
    {
        Class<? extends Object>[] cls=AnnotationHelper.findAnnotation(ServiceMarshaller.class);
        for (Class<? extends Object> c : cls)
        {
            System.err.println(c);
        }
    }
}
