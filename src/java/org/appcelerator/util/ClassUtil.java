/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
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
package org.appcelerator.util;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * ClassUtil
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class ClassUtil
{
    public static Set<Class> getAllInterfaces(Class clazz)
    {
        Set<Class> interfaces = new HashSet<Class>();
        getAllInterfaces(interfaces, clazz);
        return interfaces;
    }

    public static void getAllInterfaces(Set<Class> interfaces, Class clazz)
    {
        Class[] clazzInterfaces = clazz.getInterfaces();

        for (Class clazzInterface : clazzInterfaces)
        {
            getAllInterfaces(interfaces, clazzInterface);
        }

        Class superClazz = clazz.getSuperclass();
        if (null != superClazz)
        {
            getAllInterfaces(interfaces, superClazz);
        }

        interfaces.addAll(Arrays.asList(clazzInterfaces));
    }

    public static boolean implementsInterface(Class clazz, Class interfaceClazz)
    {
        return getAllInterfaces(clazz).contains(interfaceClazz);
    }
}
