/**
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.appcelerator.messaging;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

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
