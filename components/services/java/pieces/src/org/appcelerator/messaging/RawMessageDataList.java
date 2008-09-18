
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
