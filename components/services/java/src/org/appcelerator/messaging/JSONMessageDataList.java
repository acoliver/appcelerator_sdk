/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
package org.appcelerator.messaging;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.NoSuchElementException;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.JSONString;

/**
 * JSONMessageDataList is a JSON-based implementation of IMessageDataList.
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class JSONMessageDataList<T> implements IMessageDataList<T>, JSONString
{
    /**
     * internal JSONArray which backs our list.
     */
    private JSONArray jsonArray;

    /**
     * constructs a new JSONMessageDataList.
     */
    public JSONMessageDataList()
    {
        this.jsonArray = new JSONArray();
    }

    /**
     * constructs a new JSONMessagDataList frrom the specified JSONArray
     *
     * @param jsonArray JSON-based array to be used to back the list
     */
    public JSONMessageDataList(JSONArray jsonArray)
    {
        this.jsonArray = jsonArray;
    }

    /**
     * Convert the list to a serializable String based representation.
     *
     * @return serializable String representation of the list.
     */
    public String toDataString()
    {
        return jsonArray.toString();
    }

    /**
     * Returns the number of elements in this list.  If this list contains
     * more than <tt>Integer.MAX_VALUE</tt> elements, returns
     * <tt>Integer.MAX_VALUE</tt>.
     *
     * @return the number of elements in this list.
     */
    public int size()
    {
        return jsonArray.size();
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
    public boolean contains(Object o)
    {
        final int length = size();
        for (int index = 0; length > index; ++index)
        {
            if (o.equals(jsonArray.opt(index)))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns <tt>true</tt> if this list contains no elements.
     *
     * @return <tt>true</tt> if this list contains no elements.
     */
    public boolean isEmpty()
    {
        return 0 == size();
    }

    /**
     * Returns an iterator over the elements in this list in proper sequence.
     *
     * @return an iterator over the elements in this list in proper sequence.
     */
    public Iterator<T> iterator()
    {
        return listIterator();
    }

    /**
     * Returns an array containing all of the elements in this list in proper
     * sequence.  Obeys the general contract of the
     * <tt>Collection.toArray</tt> method.
     *
     * @return an array containing all of the elements in this list in proper
     *         sequence.
     * @see java.util.Arrays#asList
     */
    public Object[] toArray()
    {
        final int size = size();
        Object[] objects = new Object[size];

        for (int index = 0; size > index; ++index)
        {
            objects[index] = jsonArray.opt(index);
        }

        return objects;
    }

    /**
     * Returns an array containing all of the elements in this list in proper
     * sequence; the runtime type of the returned array is that of the
     * specified array.  Obeys the general contract of the
     * <tt>Collection.toArray(Object[])</tt> method.
     *
     * @param a the array into which the elements of this list are to
     *          be stored, if it is big enough; otherwise, a new array of the
     *          same runtime type is allocated for this purpose.
     * @return an array containing the elements of this list.
     * @throws ArrayStoreException  if the runtime type of the specified array
     *                              is not a supertype of the runtime type of every element in
     *                              this list.
     * @throws NullPointerException if the specified array is <tt>null</tt>.
     */
    @SuppressWarnings("unchecked")
    public <E> E[] toArray(E[] a)
    {
        final int size = size();
        if (a.length < size)
        {
            a = (E[]) Array.newInstance(a.getClass().getComponentType(), size);
        }

        Object[] results = a;
        for (int index = 0; size > index; ++index)
        {
            results[index] = jsonArray.opt(index);
        }

        if (a.length > size)
        {
            a[size] = null;
        }

        return a;
    }

    /**
     * Appends the specified element to the end of this list (optional
     * operation). <p>
     * <p/>
     * Lists that support this operation may place limitations on what
     * elements may be added to this list.  In particular, some
     * lists will refuse to add null elements, and others will impose
     * restrictions on the type of elements that may be added.  List
     * classes should clearly specify in their documentation any restrictions
     * on what elements may be added.
     *
     * @param o element to be appended to this list.
     * @return <tt>true</tt> (as per the general contract of the
     *         <tt>Collection.add</tt> method).
     * @throws UnsupportedOperationException if the <tt>add</tt> method is not
     *                                       supported by this list.
     * @throws ClassCastException            if the class of the specified element
     *                                       prevents it from being added to this list.
     * @throws NullPointerException          if the specified element is null and this
     *                                       list does not support null elements.
     * @throws IllegalArgumentException      if some aspect of this element
     *                                       prevents it from being added to this list.
     */
    public boolean add(T o)
    {
        jsonArray.add(o);
        return true;
    }

    /**
     * Removes the first occurrence in this list of the specified element
     * (optional operation).  If this list does not contain the element, it is
     * unchanged.  More formally, removes the element with the lowest index i
     * such that <tt>(o==null ? get(i)==null : o.equals(get(i)))</tt> (if
     * such an element exists).
     *
     * @param o element to be removed from this list, if present.
     * @return <tt>true</tt> if this list contained the specified element.
     * @throws ClassCastException            if the type of the specified element
     *                                       is incompatible with this list (optional).
     * @throws NullPointerException          if the specified element is null and this
     *                                       list does not support null elements (optional).
     * @throws UnsupportedOperationException if the <tt>remove</tt> method is
     *                                       not supported by this list.
     */
    public boolean remove(Object o)
    {
        return jsonArray.remove(o);
    }

    /**
     * Returns <tt>true</tt> if this list contains all of the elements of the
     * specified collection.
     *
     * @param c collection to be checked for containment in this list.
     * @return <tt>true</tt> if this list contains all of the elements of the
     *         specified collection.
     * @throws ClassCastException   if the types of one or more elements
     *                              in the specified collection are incompatible with this
     *                              list (optional).
     * @throws NullPointerException if the specified collection contains one
     *                              or more null elements and this list does not support null
     *                              elements (optional) or if the specified collection is
     *                              <tt>null</tt>.
     * @see #contains(Object)
     */
    public boolean containsAll(Collection<?> c)
    {
        for (Object object : c)
        {
            if (!contains(object))
            {
                return false;
            }
        }

        return true;
    }

    /**
     * Appends all of the elements in the specified collection to the end of
     * this list, in the order that they are returned by the specified
     * collection's iterator (optional operation).  The behavior of this
     * operation is unspecified if the specified collection is modified while
     * the operation is in progress.  (Note that this will occur if the
     * specified collection is this list, and it's nonempty.)
     *
     * @param c collection whose elements are to be added to this list.
     * @return <tt>true</tt> if this list changed as a result of the call.
     * @throws UnsupportedOperationException if the <tt>addAll</tt> method is
     *                                       not supported by this list.
     * @throws ClassCastException            if the class of an element in the specified
     *                                       collection prevents it from being added to this list.
     * @throws NullPointerException          if the specified collection contains one
     *                                       or more null elements and this list does not support null
     *                                       elements, or if the specified collection is <tt>null</tt>.
     * @throws IllegalArgumentException      if some aspect of an element in the
     *                                       specified collection prevents it from being added to this
     *                                       list.
     * @see #add(Object)
     */
    public boolean addAll(Collection<? extends T> c)
    {
        for (T element : c)
        {
            add(element);
        }
        return true;
    }

    /**
     * Inserts all of the elements in the specified collection into this
     * list at the specified position (optional operation).  Shifts the
     * element currently at that position (if any) and any subsequent
     * elements to the right (increases their indices).  The new elements
     * will appear in this list in the order that they are returned by the
     * specified collection's iterator.  The behavior of this operation is
     * unspecified if the specified collection is modified while the
     * operation is in progress.  (Note that this will occur if the specified
     * collection is this list, and it's nonempty.)
     *
     * @param index index at which to insert first element from the specified
     *              collection.
     * @param c     elements to be inserted into this list.
     * @return <tt>true</tt> if this list changed as a result of the call.
     * @throws UnsupportedOperationException if the <tt>addAll</tt> method is
     *                                       not supported by this list.
     * @throws ClassCastException            if the class of one of elements of the
     *                                       specified collection prevents it from being added to this
     *                                       list.
     * @throws NullPointerException          if the specified collection contains one
     *                                       or more null elements and this list does not support null
     *                                       elements, or if the specified collection is <tt>null</tt>.
     * @throws IllegalArgumentException      if some aspect of one of elements of
     *                                       the specified collection prevents it from being added to
     *                                       this list.
     * @throws IndexOutOfBoundsException     if the index is out of range (index
     *                                       &lt; 0 || index &gt; size()).
     */
    public boolean addAll(int index, Collection<? extends T> c)
    {
        throw new UnsupportedOperationException("addAll(int index, Collection<? extends T> c) operation not supported for " + this);
    }

    /**
     * Removes from this list all the elements that are contained in the
     * specified collection (optional operation).
     *
     * @param c collection that defines which elements will be removed from
     *          this list.
     * @return <tt>true</tt> if this list changed as a result of the call.
     * @throws UnsupportedOperationException if the <tt>removeAll</tt> method
     *                                       is not supported by this list.
     * @throws ClassCastException            if the types of one or more elements
     *                                       in this list are incompatible with the specified
     *                                       collection (optional).
     * @throws NullPointerException          if this list contains one or more
     *                                       null elements and the specified collection does not support
     *                                       null elements (optional) or if the specified collection is
     *                                       <tt>null</tt>.
     * @see #remove(Object)
     * @see #contains(Object)
     */
    public boolean removeAll(Collection<?> c)
    {
        throw new UnsupportedOperationException("removeAll(Collection<?> c) operation not supported for " + this);
    }

    /**
     * Retains only the elements in this list that are contained in the
     * specified collection (optional operation).  In other words, removes
     * from this list all the elements that are not contained in the specified
     * collection.
     *
     * @param c collection that defines which elements this set will retain.
     * @return <tt>true</tt> if this list changed as a result of the call.
     * @throws UnsupportedOperationException if the <tt>retainAll</tt> method
     *                                       is not supported by this list.
     * @throws ClassCastException            if the types of one or more elements
     *                                       in this list are incompatible with the specified
     *                                       collection (optional).
     * @throws NullPointerException          if this list contains one or more
     *                                       null elements and the specified collection does not support
     *                                       null elements (optional) or if the specified collection is
     *                                       <tt>null</tt>.
     * @see #remove(Object)
     * @see #contains(Object)
     */
    public boolean retainAll(Collection<?> c)
    {
        throw new UnsupportedOperationException("retainAll(Collection<?> c) operation not supported for " + this);
    }

    /**
     * Removes all of the elements from this list (optional operation).  This
     * list will be empty after this call returns (unless it throws an
     * exception).
     *
     * @throws UnsupportedOperationException if the <tt>clear</tt> method is
     *                                       not supported by this list.
     */
    public void clear()
    {
        jsonArray = new JSONArray();
    }

    /**
     * Returns the element at the specified position in this list.
     *
     * @param index index of element to return.
     * @return the element at the specified position in this list.
     * @throws IndexOutOfBoundsException if the index is out of range (index
     *                                   &lt; 0 || index &gt;= size()).
     */
    @SuppressWarnings("unchecked")
    public T get(int index)
    {
        Object object = jsonArray.opt(index);
        T returnObject;

        if (JSONMessageDataObject.JSONNULL.equals(object))
        {
            returnObject = null;
        }
        else if (object instanceof JSONObject)
        {
            returnObject = (T) new JSONMessageDataObject((JSONObject) object);
        }
        else
        {
            returnObject = (T) object;
        }

        return returnObject;
    }

    /**
     * Replaces the element at the specified position in this list with the
     * specified element (optional operation).
     *
     * @param index   index of element to replace.
     * @param element element to be stored at the specified position.
     * @return the element previously at the specified position.
     * @throws UnsupportedOperationException if the <tt>set</tt> method is not
     *                                       supported by this list.
     * @throws ClassCastException            if the class of the specified element
     *                                       prevents it from being added to this list.
     * @throws NullPointerException          if the specified element is null and
     *                                       this list does not support null elements.
     * @throws IllegalArgumentException      if some aspect of the specified
     *                                       element prevents it from being added to this list.
     * @throws IndexOutOfBoundsException     if the index is out of range
     *                                       (index &lt; 0 || index &gt;= size()).
     */
    public T set(int index, T element)
    {
        throw new UnsupportedOperationException("set(int index, T element) operation not supported for " + this);
    }

    /**
     * Inserts the specified element at the specified position in this list
     * (optional operation).  Shifts the element currently at that position
     * (if any) and any subsequent elements to the right (adds one to their
     * indices).
     *
     * @param index   index at which the specified element is to be inserted.
     * @param element element to be inserted.
     * @throws UnsupportedOperationException if the <tt>add</tt> method is not
     *                                       supported by this list.
     * @throws ClassCastException            if the class of the specified element
     *                                       prevents it from being added to this list.
     * @throws NullPointerException          if the specified element is null and
     *                                       this list does not support null elements.
     * @throws IllegalArgumentException      if some aspect of the specified
     *                                       element prevents it from being added to this list.
     * @throws IndexOutOfBoundsException     if the index is out of range
     *                                       (index &lt; 0 || index &gt; size()).
     */
    public void add(int index, T element)
    {
        throw new UnsupportedOperationException("add(int index, T element) operation not supported for " + this);
    }

    /**
     * Removes the element at the specified position in this list (optional
     * operation).  Shifts any subsequent elements to the left (subtracts one
     * from their indices).  Returns the element that was removed from the
     * list.
     *
     * @param index the index of the element to removed.
     * @return the element previously at the specified position.
     * @throws UnsupportedOperationException if the <tt>remove</tt> method is
     *                                       not supported by this list.
     * @throws IndexOutOfBoundsException     if the index is out of range (index
     *                                       &lt; 0 || index &gt;= size()).
     */
    @SuppressWarnings("unchecked")
    public T remove(int index)
    {
        return (T) jsonArray.remove(index);
    }

    /**
     * Returns the index in this list of the first occurrence of the specified
     * element, or -1 if this list does not contain this element.
     * More formally, returns the lowest index <tt>i</tt> such that
     * <tt>(o==null ? get(i)==null : o.equals(get(i)))</tt>,
     * or -1 if there is no such index.
     *
     * @param o element to search for.
     * @return the index in this list of the first occurrence of the specified
     *         element, or -1 if this list does not contain this element.
     * @throws ClassCastException   if the type of the specified element
     *                              is incompatible with this list (optional).
     * @throws NullPointerException if the specified element is null and this
     *                              list does not support null elements (optional).
     */
    public int indexOf(Object o)
    {
        final int length = size();
        for (int index = 0; length > index; ++index)
        {
            if (o.equals(jsonArray.opt(index)))
            {
                return index;
            }
        }

        return -1;
    }

    /**
     * Returns the index in this list of the last occurrence of the specified
     * element, or -1 if this list does not contain this element.
     * More formally, returns the highest index <tt>i</tt> such that
     * <tt>(o==null ? get(i)==null : o.equals(get(i)))</tt>,
     * or -1 if there is no such index.
     *
     * @param o element to search for.
     * @return the index in this list of the last occurrence of the specified
     *         element, or -1 if this list does not contain this element.
     * @throws ClassCastException   if the type of the specified element
     *                              is incompatible with this list (optional).
     * @throws NullPointerException if the specified element is null and this
     *                              list does not support null elements (optional).
     */
    public int lastIndexOf(Object o)
    {
        final int length = size();
        int lastIndex = -1;
        for (int index = 0; length > index; ++index)
        {
            if (o.equals(jsonArray.opt(index)))
            {
                lastIndex = index;
            }
        }

        return lastIndex;
    }

    /**
     * Returns a list iterator of the elements in this list (in proper
     * sequence).
     *
     * @return a list iterator of the elements in this list (in proper
     *         sequence).
     */
    public ListIterator<T> listIterator()
    {
        return listIterator(0);
    }

    /**
     * Returns a list iterator of the elements in this list (in proper
     * sequence), starting at the specified position in this list.  The
     * specified index indicates the first element that would be returned by
     * an initial call to the <tt>next</tt> method.  An initial call to
     * the <tt>previous</tt> method would return the element with the
     * specified index minus one.
     *
     * @param index index of first element to be returned from the
     *              list iterator (by a call to the <tt>next</tt> method).
     * @return a list iterator of the elements in this list (in proper
     *         sequence), starting at the specified position in this list.
     * @throws IndexOutOfBoundsException if the index is out of range (index
     *                                   &lt; 0 || index &gt; size()).
     */
    public ListIterator<T> listIterator(int index)
    {
        return new JSONMessageDataListIterator<T>(index);
    }

    /**
     * Returns a view of the portion of this list between the specified
     * <tt>fromIndex</tt>, inclusive, and <tt>toIndex</tt>, exclusive.  (If
     * <tt>fromIndex</tt> and <tt>toIndex</tt> are equal, the returned list is
     * empty.)  The returned list is backed by this list, so non-structural
     * changes in the returned list are reflected in this list, and vice-versa.
     * The returned list supports all of the optional list operations supported
     * by this list.<p>
     * <p/>
     * This method eliminates the need for explicit range operations (of
     * the sort that commonly exist for arrays).   Any operation that expects
     * a list can be used as a range operation by passing a subList view
     * instead of a whole list.  For example, the following idiom
     * removes a range of elements from a list:
     * <pre>
     * 	    list.subList(from, to).clear();
     * </pre>
     * Similar idioms may be constructed for <tt>indexOf</tt> and
     * <tt>lastIndexOf</tt>, and all of the algorithms in the
     * <tt>Collections</tt> class can be applied to a subList.<p>
     * <p/>
     * The semantics of the list returned by this method become undefined if
     * the backing list (i.e., this list) is <i>structurally modified</i> in
     * any way other than via the returned list.  (Structural modifications are
     * those that change the size of this list, or otherwise perturb it in such
     * a fashion that iterations in progress may yield incorrect results.)
     *
     * @param fromIndex low endpoint (inclusive) of the subList.
     * @param toIndex   high endpoint (exclusive) of the subList.
     * @return a view of the specified range within this list.
     * @throws IndexOutOfBoundsException for an illegal endpoint index value
     *                                   (fromIndex &lt; 0 || toIndex &gt; size || fromIndex &gt; toIndex).
     */
    public List<T> subList(int fromIndex, int toIndex)
    {
        JSONArray jsonArray = new JSONArray();

        for (int index = fromIndex; index < toIndex; ++index)
        {
            jsonArray.add(this.jsonArray.opt(index));
        }

        return new JSONMessageDataList<T>(jsonArray);
    }

    /**
     * JSONMessageDataListIterator is an implementation of ListIterator for a JSONMessageDataList.
     *
     * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
     */
    private class JSONMessageDataListIterator<E> implements ListIterator<E>
    {
        /**
         * internal current index of the iterator
         */
        private int index = 0;

        /**
         * constructs a new JSONMessageDataListIterator at the specified index.
         *
         * @param index specified index to start at
         * @throws IndexOutOfBoundsException if index outside of appropriate range for list
         */
        public JSONMessageDataListIterator(int index) throws IndexOutOfBoundsException
        {
            final int size = size();

            if (size <= index)
            {
                if (0 != size || 0 != index)
                {
                    throw new IndexOutOfBoundsException("index " + index + " out of range for " + this);
                }
            }

            this.index = index;
        }

        /**
         * Returns <tt>true</tt> if this list iterator has more elements when
         * traversing the list in the forward direction. (In other words, returns
         * <tt>true</tt> if <tt>next</tt> would return an element rather than
         * throwing an exception.)
         *
         * @return <tt>true</tt> if the list iterator has more elements when
         *         traversing the list in the forward direction.
         */
        public boolean hasNext()
        {
            return size() != index;
        }

        /**
         * Returns the next element in the list.  This method may be called
         * repeatedly to iterate through the list, or intermixed with calls to
         * <tt>previous</tt> to go back and forth.  (Note that alternating calls
         * to <tt>next</tt> and <tt>previous</tt> will return the same element
         * repeatedly.)
         *
         * @return the next element in the list.
         * @throws java.util.NoSuchElementException
         *          if the iteration has no next element.
         */
        @SuppressWarnings("unchecked")
        public E next()
        {
            if (!hasNext())
            {
                throw new NoSuchElementException("no more elements");
            }

            return (E) get(index++);
        }

        /**
         * Returns <tt>true</tt> if this list iterator has more elements when
         * traversing the list in the reverse direction.  (In other words, returns
         * <tt>true</tt> if <tt>previous</tt> would return an element rather than
         * throwing an exception.)
         *
         * @return <tt>true</tt> if the list iterator has more elements when
         *         traversing the list in the reverse direction.
         */
        public boolean hasPrevious()
        {
            return 0 != index;
        }

        /**
         * Returns the previous element in the list.  This method may be called
         * repeatedly to iterate through the list backwards, or intermixed with
         * calls to <tt>next</tt> to go back and forth.  (Note that alternating
         * calls to <tt>next</tt> and <tt>previous</tt> will return the same
         * element repeatedly.)
         *
         * @return the previous element in the list.
         * @throws java.util.NoSuchElementException
         *          if the iteration has no previous
         *          element.
         */
        @SuppressWarnings("unchecked")
        public E previous()
        {
            if (!hasPrevious())
            {
                throw new NoSuchElementException("no previous element");
            }

            return (E) get(--index);
        }

        /**
         * Returns the index of the element that would be returned by a subsequent
         * call to <tt>next</tt>. (Returns list size if the list iterator is at the
         * end of the list.)
         *
         * @return the index of the element that would be returned by a subsequent
         *         call to <tt>next</tt>, or list size if list iterator is at end
         *         of list.
         */
        public int nextIndex()
        {
            return index;
        }

        /**
         * Returns the index of the element that would be returned by a subsequent
         * call to <tt>previous</tt>. (Returns -1 if the list iterator is at the
         * beginning of the list.)
         *
         * @return the index of the element that would be returned by a subsequent
         *         call to <tt>previous</tt>, or -1 if list iterator is at
         *         beginning of list.
         */
        public int previousIndex()
        {
            return index - 1;
        }

        /**
         * Removes from the list the last element that was returned by
         * <tt>next</tt> or <tt>previous</tt> (optional operation).  This call can
         * only be made once per call to <tt>next</tt> or <tt>previous</tt>.  It
         * can be made only if <tt>ListIterator.add</tt> has not been called after
         * the last call to <tt>next</tt> or <tt>previous</tt>.
         *
         * @throws UnsupportedOperationException if the <tt>remove</tt>
         *                                       operation is not supported by this list iterator.
         * @throws IllegalStateException         neither <tt>next</tt> nor
         *                                       <tt>previous</tt> have been called, or <tt>remove</tt> or
         *                                       <tt>add</tt> have been called after the last call to *
         *                                       <tt>next</tt> or <tt>previous</tt>.
         */
        public void remove()
        {
            throw new UnsupportedOperationException("remove not supported for " + this);
        }

        /**
         * Replaces the last element returned by <tt>next</tt> or
         * <tt>previous</tt> with the specified element (optional operation).
         * This call can be made only if neither <tt>ListIterator.remove</tt> nor
         * <tt>ListIterator.add</tt> have been called after the last call to
         * <tt>next</tt> or <tt>previous</tt>.
         *
         * @param o the element with which to replace the last element returned by
         *          <tt>next</tt> or <tt>previous</tt>.
         * @throws UnsupportedOperationException if the <tt>set</tt> operation
         *                                       is not supported by this list iterator.
         * @throws ClassCastException            if the class of the specified element
         *                                       prevents it from being added to this list.
         * @throws IllegalArgumentException      if some aspect of the specified
         *                                       element prevents it from being added to this list.
         * @throws IllegalStateException         if neither <tt>next</tt> nor
         *                                       <tt>previous</tt> have been called, or <tt>remove</tt> or
         *                                       <tt>add</tt> have been called after the last call to
         *                                       <tt>next</tt> or <tt>previous</tt>.
         */
        public void set(E o)
        {
            throw new UnsupportedOperationException("set not supported for " + this);
        }

        /**
         * Inserts the specified element into the list (optional operation).  The
         * element is inserted immediately before the next element that would be
         * returned by <tt>next</tt>, if any, and after the next element that
         * would be returned by <tt>previous</tt>, if any.  (If the list contains
         * no elements, the new element becomes the sole element on the list.)
         * The new element is inserted before the implicit cursor: a subsequent
         * call to <tt>next</tt> would be unaffected, and a subsequent call to
         * <tt>previous</tt> would return the new element.  (This call increases
         * by one the value that would be returned by a call to <tt>nextIndex</tt>
         * or <tt>previousIndex</tt>.)
         *
         * @param o the element to insert.
         * @throws UnsupportedOperationException if the <tt>add</tt> method is
         *                                       not supported by this list iterator.
         * @throws ClassCastException            if the class of the specified element
         *                                       prevents it from being added to this list.
         * @throws IllegalArgumentException      if some aspect of this element
         *                                       prevents it from being added to this list.
         */
        public void add(E o)
        {
            throw new UnsupportedOperationException("add not supported for " + this);
        }
    }

    /**
     * The <code>toJSONString</code> method allows a class to produce its own JSON
     * serialization.
     *
     * @return A strictly syntactically correct JSON text.
     */
    public String toJSONString()
    {
        return jsonArray.toString();
    }

    /**
     * Returns a string representation of the object. In general, the
     * <code>toString</code> method returns a string that
     * "textually represents" this object. The result should
     * be a concise but informative representation that is easy for a
     * person to read.
     * It is recommended that all subclasses override this method.
     * <p/>
     * The <code>toString</code> method for class <code>Object</code>
     * returns a string consisting of the name of the class of which the
     * object is an instance, the at-sign character `<code>@</code>', and
     * the unsigned hexadecimal representation of the hash code of the
     * object. In other words, this method returns a string equal to the
     * value of:
     * <blockquote>
     * <pre>
     * getClass().getName() + '@' + Integer.toHexString(hashCode())
     * </pre></blockquote>
     *
     * @return a string representation of the object.
     */
    @Override
    public String toString()
    {
        return toJSONString();
    }
}
