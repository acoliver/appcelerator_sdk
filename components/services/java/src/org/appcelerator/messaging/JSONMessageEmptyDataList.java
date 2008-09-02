
/* 
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
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

    @SuppressWarnings("unchecked")
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
