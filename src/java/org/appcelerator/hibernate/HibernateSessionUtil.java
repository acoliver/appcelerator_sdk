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
package org.appcelerator.hibernate;

import java.util.concurrent.Callable;

import org.springframework.transaction.annotation.Transactional;

/**
 * HibernateSessionUtil is a simple utility for executing hibernate actions within
 * the context of a single transaction/session.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class HibernateSessionUtil
{
    /**
     * execute a command inside a hibernate single session context. this is just a simple
     * utility method in cases where you cannot use the HibernateSession or Transactional annotations on your method.
     *
     * @param action callable action be performed in the session content
     * @return return type specified by callable
     * @throws Exception upon error
     */
    @Transactional
    public <T> Object executeInHibernateSession(Callable<T> action) throws Exception
    {
        return action.call();
    }

}
