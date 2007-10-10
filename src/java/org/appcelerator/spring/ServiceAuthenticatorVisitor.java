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

public class ServiceAuthenticatorVisitor implements AnnotationUtil.IMethodVisitor
{
    private Method method;
    private Object bean;
    
    /**
     * called to visit a method on a bean
     *
     * @param bean   bean to visit
     * @param method method to visit
     * @throws Exception upon error
     */
    public void visit(Object bean, Method method) throws Exception
    {
        if (this.bean!=null)
        {
            throw new Exception("ServiceAuthenticator already found in class: "+bean.getClass().getName()+"."+method.getName());
        }
        
        this.bean = bean;
        this.method = method;
        this.method.setAccessible(true);
    }
    
    Method getMethod ()
    {
        return this.method;
    }
    
    Object getService ()
    {
        return this.bean;
    }
}
