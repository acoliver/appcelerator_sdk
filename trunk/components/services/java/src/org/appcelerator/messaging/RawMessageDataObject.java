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

import java.util.Set;

public class RawMessageDataObject implements IMessageDataObject
{
    private String json;

    public RawMessageDataObject(String json)
    {
        this.json = json;
    }

    public String toDataString()
    {
        return json;
    }

    public boolean getBoolean(String key) throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return false;
    }

    public IMessageDataList<Boolean> getBooleanArray(String key)
            throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return null;
    }

    public Class getClass(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public double getDouble(String key) throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public IMessageDataList<Double> getDoubleArray(String key)
            throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return null;
    }

    public float getFloat(String key) throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public int getInt(String key) throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public IMessageDataList<Integer> getIntArray(String key)
            throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return null;
    }

    public long getLong(String key) throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public IMessageDataList<Long> getLongArray(String key)
            throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataObject getObject(String key)
            throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<IMessageDataObject> getObjectArray(String key)
            throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return null;
    }

    public String getString(String key) throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<String> getStringArray(String key)
            throws MessageDataObjectException
    {
        // TODO Auto-generated method stub
        return null;
    }

    public Set<String> keySet()
    {
        // TODO Auto-generated method stub
        return null;
    }

    public boolean optBoolean(String key)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public boolean optBoolean(String key, boolean defaultValue)
    {
        // TODO Auto-generated method stub
        return false;
    }

    public IMessageDataList<Boolean> optBooleanArray(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<Boolean> optBooleanArray(String key,
            IMessageDataList<Boolean> defaultValue)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public double optDouble(String key)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public double optDouble(String key, double defaultValue)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public IMessageDataList<Double> optDoubleArray(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<Double> optDoubleArray(String key,
            IMessageDataList<Double> defaultValue)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public float optFloat(String key)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public float optFloat(String key, float defaultValue)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public int optInt(String key)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public int optInt(String key, int defaultValue)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public IMessageDataList<Integer> optIntArray(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<Integer> optIntArray(String key,
            IMessageDataList<Integer> defaultValue)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public long optLong(String key)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public long optLong(String key, long defaultValue)
    {
        // TODO Auto-generated method stub
        return 0;
    }

    public IMessageDataList<Long> optLongArray(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<Long> optLongArray(String key,
            IMessageDataList<Long> defaultValue)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataObject optObject(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataObject optObject(String key,
            IMessageDataObject defaultValue)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<IMessageDataObject> optObjectArray(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<IMessageDataObject> optObjectArray(String key,
            IMessageDataList<IMessageDataObject> defaultValue)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public String optString(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public String optString(String key, String defaultValue)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<String> optStringArray(String key)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataList<String> optStringArray(String key,
            IMessageDataList<String> defaultValue)
    {
        // TODO Auto-generated method stub
        return null;
    }

    public IMessageDataObject put(String key, Object value)
    {
        // TODO Auto-generated method stub
        return null;
    }

}
