
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

    @SuppressWarnings("unchecked")
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
