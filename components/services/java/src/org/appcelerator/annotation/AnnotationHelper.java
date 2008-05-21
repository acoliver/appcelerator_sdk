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
