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

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

@SuppressWarnings("unchecked")
public class RawMessageDataList implements IMessageDataList
{
    private String json;

    public RawMessageDataList(String json)
    {
        this.json = json;
    }

    public boolean add(Object arg0)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public void add(int arg0, Object arg1)
    {
        // TODO Auto-generated method stub

    }

    public boolean addAll(Collection arg0)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public boolean addAll(int arg0, Collection arg1)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public void clear()
    {
        // TODO Auto-generated method stub

    }

    public boolean contains(Object arg0)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public boolean containsAll(Collection arg0)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public Object get(int arg0)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public int indexOf(Object arg0)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public boolean isEmpty()
    {
        // TODO Auto-generated method stub
        return false;
    }

    public Iterator iterator()
    {
        // TODO Auto-generated method stub
        return null;
    }

    public int lastIndexOf(Object arg0)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public ListIterator listIterator()
    {
        // TODO Auto-generated method stub
        return null;
    }

    public ListIterator listIterator(int arg0)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean remove(Object arg0)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public Object remove(int arg0)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean removeAll(Collection arg0)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public boolean retainAll(Collection arg0)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public Object set(int arg0, Object arg1)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public int size()
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public List subList(int arg0, int arg1)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public Object[] toArray()
    {
        // TODO Auto-generated method stub
        return null;
    }

    public Object[] toArray(Object[] arg0)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public String toDataString()
    {
        // TODO Auto-generated method stub
        return json;
    }

}
