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
package org.appcelerator.util;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * ClassUtil
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
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
