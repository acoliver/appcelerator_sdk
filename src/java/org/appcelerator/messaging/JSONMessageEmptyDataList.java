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
package org.appcelerator.messaging;

import java.io.Serializable;
import java.util.RandomAccess;

/**
 * JSONMessageEmptyDataList
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public final class JSONMessageEmptyDataList<T> extends JSONMessageDataList<T> implements RandomAccess, Serializable
{
    private static final long serialVersionUID = 1L;

    public static final JSONMessageEmptyDataList EMPTY_LIST = new JSONMessageEmptyDataList();

    @SuppressWarnings("unchecked")
    public static <T> IMessageDataList<T> emptyList()
    {
        return (IMessageDataList<T>) EMPTY_LIST;
    }

    /**
     * Returns the number of elements in this list.  If this list contains
     * more than <tt>Integer.MAX_VALUE</tt> elements, returns
     * <tt>Integer.MAX_VALUE</tt>.
     *
     * @return the number of elements in this list.
     */
    @Override
    public int size()
    {
        return 0;
    }

    /**
     * Returns <tt>true</tt> if this list contains the specified element.
     * More formally, returns <tt>true</tt> if and only if this list contains
     * at least one element <tt>e</tt> such that
     * <tt>(o==null&nbsp;?&nbsp;e==null&nbsp;:&nbsp;o.equals(e))</tt>.
     *
     * @param o element whose presence in this list is to be tested.
     * @return <tt>true</tt> if this list contains the specified element.
     * @throws ClassCastException   if the type of the specified element
     *                              is incompatible with this list (optional).
     * @throws NullPointerException if the specified element is null and this
     *                              list does not support null elements (optional).
     */
    @Override
    public boolean contains(Object o)
    {
        return false;
    }

    /**
     * Returns the element at the specified position in this list.
     *
     * @param index index of element to return.
     * @return the element at the specified position in this list.
     * @throws IndexOutOfBoundsException if the index is out of range (index
     *                                   &lt; 0 || index &gt;= size()).
     */
    @Override
    public T get(int index)
    {
        throw new IndexOutOfBoundsException("Index: " + index);
    }
}
