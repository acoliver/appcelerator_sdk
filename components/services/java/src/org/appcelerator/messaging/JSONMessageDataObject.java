
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
import java.util.Set;

import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONNull;
import net.sf.json.JSONObject;
import net.sf.json.JSONString;

import org.appcelerator.model.IModelObject;
import org.appcelerator.util.DateUtil;

/**
 * JSONMessageDataObject is a JSON-based implementation of IMessageDataObject
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class JSONMessageDataObject implements IMessageDataObject, JSONString
{
	/**
	 * internal JSON NULL value
	 */
	public static final JSONNull JSONNULL = JSONNull.getInstance();
	
    /**
     * internal empty boolean list (JSONMessageEmptyDataList) for use in default "opt" cases
     */
    private static final IMessageDataList<Boolean> EMPTY_BOOLEAN_LIST = JSONMessageEmptyDataList.emptyList();
    /**
     * internal empty double list (JSONMessageEmptyDataList) for use in default "opt" cases
     */
    private static final IMessageDataList<Double> EMPTY_DOUBLE_LIST = JSONMessageEmptyDataList.emptyList();
    /**
     * internal empty integer list (JSONMessageEmptyDataList) for use in default "opt" cases
     */
    private static final IMessageDataList<Integer> EMPTY_INTEGER_LIST = JSONMessageEmptyDataList.emptyList();
    /**
     * internal empty long list (JSONMessageEmptyDataList) for use in default "opt" cases
     */
    private static final IMessageDataList<Long> EMPTY_LONG_LIST = JSONMessageEmptyDataList.emptyList();
    /**
     * internal empty string list (JSONMessageEmptyDataList) for use in default "opt" cases
     */
    private static final IMessageDataList<String> EMPTY_STRING_LIST = JSONMessageEmptyDataList.emptyList();
    /**
     * internal empty IMessageDataObject list (JSONMessageEmptyDataList) for use in default "opt" cases
     */
    private static final IMessageDataList<IMessageDataObject> EMPTY_OBJECT_LIST = JSONMessageEmptyDataList.emptyList();
    /**
     * internal JSONObject backing this JSONMessageDataObject
     */
    private JSONObject jsonObject;

    /**
     * constructs a new empty JSONMessageDataObject
     */
    public JSONMessageDataObject()
    {
        this.jsonObject = new JSONObject();
    }

    /**
     * constructs a new JSONMessageDataObject based on the specified JSONObject
     *
     * @param jsonObject JSONObject to be used by this object
     */
    public JSONMessageDataObject(JSONObject jsonObject)
    {
        this.jsonObject = jsonObject;
    }

    /**
     * gets the underlying JSONObject which backs this JSONMessageDataObject
     *
     * @return underlying JSONObject
     */
    public JSONObject getJSONObject()
    {
        return jsonObject;
    }

    /**
     * Get the boolean value associated with a key.
     *
     * @param key String based key.
     * @return Boolean value associated with the key.
     * @throws MessageDataObjectException If the value is not a boolean or a String with values <code>"true"</code> or <code>"false"</code>.
     */
    public boolean getBoolean(String key) throws MessageDataObjectException
    {
        try
        {
            return jsonObject.getBoolean(key);
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getBoolean for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the double value associated with a key.
     *
     * @param key String based key.
     * @return Double value associated with the key.
     * @throws MessageDataObjectException If the value is not a Number object and cannot be converted to a Number.
     */
    public double getDouble(String key) throws MessageDataObjectException
    {
        try
        {
            return jsonObject.getDouble(key);
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getDouble for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the int value associated with a key.
     *
     * @param key String based key.
     * @return Int value associated with the key.
     * @throws MessageDataObjectException If the value is not a Number object and cannot be converted to a Number.
     */
    public int getInt(String key) throws MessageDataObjectException
    {
        try
        {
            return jsonObject.getInt(key);
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getInt for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the long value associated with a key.
     *
     * @param key String based key.
     * @return Long value associated with the key.
     * @throws MessageDataObjectException If the value is not a Number object and cannot be converted to a Number.
     */
    public long getLong(String key) throws MessageDataObjectException
    {
        try
        {
            return jsonObject.getLong(key);
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getLong for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the String value associated with a key.
     *
     * @param key String based key.
     * @return String value associated with the key.
     * @throws MessageDataObjectException If the key is not found.
     */
    public String getString(String key) throws MessageDataObjectException
    {
        try
        {
            return jsonObject.getString(key);
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getString for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the IMessageDataObject list associated with a key.
     *
     * @param key String based key.
     * @return List of IMessageDataObject values.
     * @throws MessageDataObjectException If the key is not found or the value is not an IMessageDataObject list.
     */
    public IMessageDataList<IMessageDataObject> getObjectArray(String key) throws MessageDataObjectException
    {
        try
        {
            return new JSONMessageDataList<IMessageDataObject>(jsonObject.getJSONArray(key));
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getObjectArray for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the boolean list associated with a key.
     *
     * @param key String based key.
     * @return List of boolean values.
     * @throws MessageDataObjectException If the key is not found or the value is not a boolean list.
     */
    public IMessageDataList<Boolean> getBooleanArray(String key) throws MessageDataObjectException
    {
        try
        {
            return new JSONMessageDataList<Boolean>(jsonObject.getJSONArray(key));
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getBooleanArray for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the double list associated with a key.
     *
     * @param key String based key.
     * @return List of double values.
     * @throws MessageDataObjectException If the key is not found or the value is not a double list.
     */
    public IMessageDataList<Double> getDoubleArray(String key) throws MessageDataObjectException
    {
        try
        {
            return new JSONMessageDataList<Double>(jsonObject.getJSONArray(key));
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getDoubleArray for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the int list associated with a key.
     *
     * @param key String based key.
     * @return List of int values.
     * @throws MessageDataObjectException If the key is not found or the value is not an int list.
     */
    public IMessageDataList<Integer> getIntArray(String key) throws MessageDataObjectException
    {
        try
        {
            return new JSONMessageDataList<Integer>(jsonObject.getJSONArray(key));
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getIntegerArray for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the long list associated with a key.
     *
     * @param key String based key.
     * @return List of long values.
     * @throws MessageDataObjectException If the key is not found or the value is not a long list.
     */
    public IMessageDataList<Long> getLongArray(String key) throws MessageDataObjectException
    {
        try
        {
            return new JSONMessageDataList<Long>(jsonObject.getJSONArray(key));
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getLongArray for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the String list associated with a key.
     *
     * @param key String based key.
     * @return List of String values.
     * @throws MessageDataObjectException If the key is not found or the value is not a String list.
     */
    public IMessageDataList<String> getStringArray(String key) throws MessageDataObjectException
    {
        try
        {
            return new JSONMessageDataList<String>(jsonObject.getJSONArray(key));
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getStringArray for key: " + key + ", reason: " + jsonException.getMessage(), jsonException);
        }
    }

    /**
     * Get the IMessageDataObject value associated with a key.
     *
     * @param key String based key.
     * @return IMessageDataObject value associated with the key.
     * @throws MessageDataObjectException If the value is not an IMessageDataObject.
     */
    public IMessageDataObject getObject(String key) throws MessageDataObjectException
    {
        JSONObject keyResult = null;
        try
        {
            keyResult = jsonObject.getJSONObject(key);
            return new JSONMessageDataObject(keyResult);
        }
        catch (JSONException jsonException)
        {
            throw new MessageDataObjectException("unable to getObject for key: " + key + ", reason: " + jsonException.getMessage()+", key value was: "+keyResult+" for "+this.toJSONString(), jsonException);
        }
    }

    /**
     * Put a key/value pair in the object.
     *
     * @param key   String based key.
     * @param value Value for this key which can be of type IMessageDataObject, boolean, double, int, long, String, or IMessageDataList.
     * @return this.
     * @throws IllegalArgumentException If the value type is not valid.
     */
    @SuppressWarnings("unchecked")
    public IMessageDataObject put(String key, Object value)
    {
        try
        {
            if (value instanceof Collection && !(value instanceof IMessageDataList))
            {
                jsonObject.put(key, (Collection) value);
            }
            else if (value instanceof JSONObject)
            {
                jsonObject.put(key, (JSONObject) value);
            }
            else if (value instanceof IModelObject)
            {
                jsonObject.put(key, JSONObject.fromObject((IModelObject)value));
            }
            else
            {
                if (value == null)
                {
                    value = JSONNULL;
                }
                else if (value instanceof java.util.Date)
                {
                    value = DateUtil.getDateAsAppFormat((java.util.Date) value);
                }
                else if (value instanceof IMessageDataObject)
                {
                    value = JSONObject.fromObject(((IMessageDataObject)value).toDataString());
                }
                else if (value instanceof IMessageDataList)
                {
                    value = JSONArray.fromObject(((IMessageDataList)value).toDataString());
                }
                else if (value instanceof IMessageDataString)
                {
                    value = ((IMessageDataString)value).toDataString();
                }
                jsonObject.put(key, value);
            }
        }
        catch (JSONException jsonException)
        {
            throw new IllegalArgumentException("unable to put key: " + key + ", value: " + value + ", reason: " + jsonException.getMessage(), jsonException);
        }

        return this;
    }

    /**
     * Get an optional boolean value associated with a key.  It will return <code>false</code> if there is no such key,
     * or if the value is not a boolean or a String with values <code>"true"</code> or <code>"false"</code>.
     *
     * @param key String based key.
     * @return Boolean value associated with the key, or <code>false</code> if no key exists or key is not proper type.
     */
    public boolean optBoolean(String key)
    {
        return optBoolean(key, false);
    }

    /**
     * Get an optional boolean value associated with a key.  It will return <code>defaultValue</code> if there is no
     * such key, or if the value is not a boolean or a String with values <code>"true"</code> or <code>"false"</code>.
     *
     * @param key          String based key.
     * @param defaultValue Default boolean value to be returned if there's not a valid <code>key</code>.
     * @return Boolean value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public boolean optBoolean(String key, boolean defaultValue)
    {
        try
        {
            return getBoolean(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get an optional double value associated with a key.  It will return <code>0.0</code> if there is no such key,
     * or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Double value associated with the key, or <code>0.0</code> if no key exists or key is not proper type.
     */
    public double optDouble(String key)
    {
        return optDouble(key, 0.0);
    }

    /**
     * Get an optional double value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key, or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Double value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public double optDouble(String key, double defaultValue)
    {
        try
        {
            return getDouble(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get an optional int value associated with a key.  It will return <code>0</code> if there is no such key,
     * or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Int value associated with the key, or <code>0</code> if no key exists or key is not proper type.
     */
    public int optInt(String key)
    {
        return optInt(key, 0);
    }

    /**
     * Get an optional int value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key, or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Int value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public int optInt(String key, int defaultValue)
    {
        try
        {
            return getInt(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get an optional long value associated with a key.  It will return <code>0</code> if there is no such key,
     * or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Long value associated with the key, or <code>0L</code> if no key exists or key is not proper type.
     */
    public long optLong(String key)
    {
        return optLong(key, 0L);
    }

    /**
     * Get an optional long value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key, or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Long value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public long optLong(String key, long defaultValue)
    {
        try
        {
            return getLong(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get an optional string value associated with a key.  It will return <code>""</code> (empty string) if there is no
     * such key.
     *
     * @param key String based key.
     * @return String value associated with the key, or <code>""</code> (empty string) if no key exists.
     */
    public String optString(String key)
    {
        return optString(key, "");
    }

    /**
     * Get an optional string value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key.
     *
     * @param key String based key.
     * @return String value associated with the key, or <code>defaultValue</code> if no key exists.
     */
    public String optString(String key, String defaultValue)
    {
        try
        {
            return getString(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get the optional IMessageDataObject list associated with a key.  It will return an empty list if there is no such
     * key or the value is not an IMessageDataObject list.
     *
     * @param key String based key.
     * @return List of IMessageDataObject values or empty list if there is no such key or the value is not an IMessageDataObject list.
     */
    public IMessageDataList<IMessageDataObject> optObjectArray(String key)
    {
        return optObjectArray(key, EMPTY_OBJECT_LIST);
    }

    /**
     * Get the optional IMessageDataObject list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not an IMessageDataObject list.
     *
     * @param key String based key.
     * @return List of IMessageDataObject values or <code>defaultValue</code> if there is no such key or the value is not an IMessageDataObject list.
     */
    public IMessageDataList<IMessageDataObject> optObjectArray(String key, IMessageDataList<IMessageDataObject> defaultValue)
    {
        try
        {
            return getObjectArray(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get the optional boolean list associated with a key.  It will return an empty list if there is no such
     * key or the value is not a boolean list.
     *
     * @param key String based key.
     * @return List of boolean values or empty list if there is no such key or the value is not a boolean list.
     */
    public IMessageDataList<Boolean> optBooleanArray(String key)
    {
        return optBooleanArray(key, EMPTY_BOOLEAN_LIST);
    }

    /**
     * Get the optional boolean list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not a boolean list.
     *
     * @param key String based key.
     * @return List of boolean values or <code>defaultValue</code> if there is no such key or the value is not a boolean list.
     */
    public IMessageDataList<Boolean> optBooleanArray(String key, IMessageDataList<Boolean> defaultValue)
    {
        try
        {
            return getBooleanArray(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get the optional double list associated with a key.  It will return an empty list if there is no such
     * key or the value is not a double list.
     *
     * @param key String based key.
     * @return List of double values or empty list if there is no such key or the value is not a double list.
     */
    public IMessageDataList<Double> optDoubleArray(String key)
    {
        return optDoubleArray(key, EMPTY_DOUBLE_LIST);
    }

    /**
     * Get the optional double list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not a double list.
     *
     * @param key String based key.
     * @return List of double values or <code>defaultValue</code> if there is no such key or the value is not a double list.
     */
    public IMessageDataList<Double> optDoubleArray(String key, IMessageDataList<Double> defaultValue)
    {
        try
        {
            return getDoubleArray(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get the optional int list associated with a key.  It will return an empty list if there is no such
     * key or the value is not an int list.
     *
     * @param key String based key.
     * @return List of int values or empty list if there is no such key or the value is not an int list.
     */
    public IMessageDataList<Integer> optIntArray(String key)
    {
        return optIntArray(key, EMPTY_INTEGER_LIST);
    }

    /**
     * Get the optional int list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not an int list.
     *
     * @param key String based key.
     * @return List of int values or <code>defaultValue</code> if there is no such key or the value is not an int list.
     */
    public IMessageDataList<Integer> optIntArray(String key, IMessageDataList<Integer> defaultValue)
    {
        try
        {
            return getIntArray(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get the optional long list associated with a key.  It will return an empty list if there is no such
     * key or the value is not a long list.
     *
     * @param key String based key.
     * @return List of long values or empty list if there is no such key or the value is not a long list.
     */
    public IMessageDataList<Long> optLongArray(String key)
    {
        return optLongArray(key, EMPTY_LONG_LIST);
    }

    /**
     * Get the optional long list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not a long list.
     *
     * @param key String based key.
     * @return List of long values or <code>defaultValue</code> if there is no such key or the value is not a long list.
     */
    public IMessageDataList<Long> optLongArray(String key, IMessageDataList<Long> defaultValue)
    {
        try
        {
            return getLongArray(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get the optional String list associated with a key.  It will return an empty list if there is no such
     * key or the value is not a String list.
     *
     * @param key String based key.
     * @return List of String values or empty list if there is no such key or the value is not a String list.
     */
    public IMessageDataList<String> optStringArray(String key)
    {
        return optStringArray(key, EMPTY_STRING_LIST);
    }

    /**
     * Get the optional String list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not a String list.
     *
     * @param key String based key.
     * @return List of String values or <code>defaultValue</code> if there is no such key or the value is not a String list.
     */
    public IMessageDataList<String> optStringArray(String key, IMessageDataList<String> defaultValue)
    {
        try
        {
            return getStringArray(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }

    /**
     * Get an optional IMessageDataObject value associated with a key.  It will return <code>null</code> if there is no
     * such key, or if the value is not a IMessageDataObject.
     *
     * @param key String based key.
     * @return IMessageDataObject value associated with the key, or <code>null</code> if no key exists or key is not proper type.
     */
    public IMessageDataObject optObject(String key)
    {
        return optObject(key, null);
    }

    /**
     * Get an optional IMessageDataObject value associated with a key.  It will return <code>defaultValue</code> if there is no
     * such key, or if the value is not a IMessageDataObject.
     *
     * @param key String based key.
     * @return IMessageDataObject value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public IMessageDataObject optObject(String key, IMessageDataObject defaultValue)
    {
        try
        {
            return getObject(key);
        }
        catch (MessageDataObjectException messageDataObjectException)
        {
            return defaultValue;
        }
    }


    /* (non-Javadoc)
     * @see org.appcelerator.messaging.IMessageDataObject#getFloat(java.lang.String)
     */
    public float getFloat(String key) throws MessageDataObjectException
    {
        try
        {
            return Float.valueOf(jsonObject.getString(key));
        }
        catch (Exception ex)
        {
            throw new MessageDataObjectException(ex);
        }
    }

    /* (non-Javadoc)
     * @see org.appcelerator.messaging.IMessageDataObject#optFloat(java.lang.String)
     */
    public float optFloat(String key)
    {
		return optFloat(key,0);
    }

    /* (non-Javadoc)
     * @see org.appcelerator.messaging.IMessageDataObject#optFloat(java.lang.String, float)
     */
    public float optFloat(String key, float defaultValue)
    {
		try
		{
			String value = jsonObject.optString(key);
			return Float.valueOf(value);
		}
		catch (Exception ex)
		{
		}
		return defaultValue;
    }
    
    /**
     * Returns a set view of the keys contained in this object.  The set is backed by the object, so changes to the object
     * are reflected in the set, and vice-versa.  If the object is modified while an iteration over the set is
     * in progress (except through the iterator's own <tt>remove</tt> operation), the results of the iteration are
     * undefined.  The set supports element removal, which removes the corresponding mapping from the object, via the
     * <tt>Iterator.remove</tt>, <tt>Set.remove</tt>, <tt>removeAll</tt> <tt>retainAll</tt>, and <tt>clear</tt>
     * operations. It does not support the add or <tt>addAll</tt> operations.
     *
     * @return a set view of the keys contained in this object.
     */
    @SuppressWarnings("unchecked")
    public Set<String> keySet()
    {
        return (Set<String>) jsonObject.keySet();
    }


    /**
     * Gets the class for the value associated with the particular key.
     *
     * @return class for value object associated with key or <code>null</code> if key not found
     */
    @SuppressWarnings("unchecked")
    public Class getClass(String key)
    {
        try
        {
            Object valueObject = jsonObject.get(key);
            if (null == valueObject)
            {
                return null;
            }

            return valueObject.getClass();
        }
        catch (JSONException e)
        {
            return null;
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
        return jsonObject.toString();
    }

    /**
     * Convert the object to a serializable String based representation.
     *
     * @return serializable String representation of the object.
     */
    public String toDataString()
    {
        return toJSONString();
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
