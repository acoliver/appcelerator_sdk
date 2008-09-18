
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
