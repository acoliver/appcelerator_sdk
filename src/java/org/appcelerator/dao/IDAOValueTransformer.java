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
package org.appcelerator.dao;


/**
 * IDAOValueTransformer is an interface that can be passed to a finder IDAO method to allow further refinement
 * of the return data.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public interface IDAOValueTransformer<T>
{
    /**
     * returns true to add the data object to the return result
     * set or false to prevent it from being added.
     *
     * @param dao dao for the object to be transformed
     * @param t   object to be transformed
     * @return <code>true</code> to add the object to return result, <code>false</code> to prevent it from being added
     */
    public boolean transform(IDAO dao, T t);
}
