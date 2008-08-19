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
