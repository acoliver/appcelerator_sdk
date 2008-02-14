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
package org.appcelerator.spring;

import java.lang.reflect.Method;

import org.appcelerator.annotation.Downloadable;
import org.appcelerator.servlet.download.DownloadServices;
import org.appcelerator.spring.AnnotationUtil.IMethodVisitor;

/**
 * DownloadVisitor is a Spring BeanPostProcessor that will do special processing of beans.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class DownloadVisitor implements IMethodVisitor
{
    public void visit(Object bean, Method method) throws Exception
    {
        Downloadable handler = method.getAnnotation(Downloadable.class);
        String name = handler.name();
        DownloadServices.register(name, bean, method);
    }
}
