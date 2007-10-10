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

import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Method;

import net.sf.cglib.proxy.MethodProxy;

import org.aopalliance.intercept.MethodInvocation;

/**
 * CgiLibMethodInvocation
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class CgiLibMethodInvocation implements MethodInvocation
{
    private final Object target;
    private final Method method;
    private final Object args[];
    private final MethodProxy proxy;

    public CgiLibMethodInvocation(Object target, Method method, Object args[], MethodProxy proxy)
    {
        this.target = target;
        this.method = method;
        this.args = args;
        this.proxy = proxy;
    }

    public Method getMethod()
    {
        return method;
    }

    public Object[] getArguments()
    {
        return args;
    }

    public AccessibleObject getStaticPart()
    {
        return method;
    }

    public Object getThis()
    {
        return target;
    }

    public Object proceed() throws Throwable
    {
        return proxy.invokeSuper(target, args);
    }
}