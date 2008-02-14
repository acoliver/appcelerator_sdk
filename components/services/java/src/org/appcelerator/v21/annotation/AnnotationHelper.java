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
package org.appcelerator.v21.annotation;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.net.URL;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.scannotation.AnnotationDB;
import org.scannotation.ClasspathUrlFinder;

/**
 * Utilities for managing and finding annotations. Uses Bill Burke's 
 * super dandy Scannotation framework.
 *
 */
public class AnnotationHelper
{
    private static Map<String, Set<String>> annotationIndex;
    
    static
    {
        URL[] urls = ClasspathUrlFinder.findClassPaths();
        AnnotationDB db = new AnnotationDB();
        try
        {
            db.scanArchives(urls);
            annotationIndex = db.getAnnotationIndex();
        }
        catch (IOException e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
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
                catch (ClassNotFoundException e)
                {
                    //THIS SHOULDN'T BE POSSIBLE 
                    e.printStackTrace();
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
