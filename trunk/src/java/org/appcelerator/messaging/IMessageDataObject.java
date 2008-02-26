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

import java.util.Set;

/**
 * IMessageDataObject is a message-based object interface for objects which will be serialized over the messaging layer.
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public interface IMessageDataObject extends IMessageDataString
{
    /**
     * Get the IMessageDataObject value associated with a key.
     *
     * @param key String based key.
     * @return IMessageDataObject value associated with the key.
     * @throws MessageDataObjectException If the value is not an IMessageDataObject.
     */
    public IMessageDataObject getObject(String key) throws MessageDataObjectException;

    /**
     * Get an optional IMessageDataObject value associated with a key.  It will return <code>null</code> if there is no
     * such key, or if the value is not a IMessageDataObject.
     *
     * @param key String based key.
     * @return IMessageDataObject value associated with the key, or <code>null</code> if no key exists or key is not proper type.
     */
    public IMessageDataObject optObject(String key);

    /**
     * Get an optional IMessageDataObject value associated with a key.  It will return <code>defaultValue</code> if there is no
     * such key, or if the value is not a IMessageDataObject.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return IMessageDataObject value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public IMessageDataObject optObject(String key, IMessageDataObject defaultValue);

    /**
     * Get the boolean value associated with a key.
     *
     * @param key String based key.
     * @return Boolean value associated with the key.
     * @throws MessageDataObjectException If the value is not a boolean or a String with values <code>"true"</code> or <code>"false"</code>.
     */
    public boolean getBoolean(String key) throws MessageDataObjectException;

    /**
     * Get an optional boolean value associated with a key.  It will return <code>false</code> if there is no such key,
     * or if the value is not a boolean or a String with values <code>"true"</code> or <code>"false"</code>.
     *
     * @param key String based key.
     * @return Boolean value associated with the key, or <code>false</code> if no key exists or key is not proper type.
     */
    public boolean optBoolean(String key);

    /**
     * Get an optional boolean value associated with a key.  It will return <code>defaultValue</code> if there is no
     * such key, or if the value is not a boolean or a String with values <code>"true"</code> or <code>"false"</code>.
     *
     * @param key          String based key.
     * @param defaultValue Default boolean value to be returned if there's not a valid <code>key</code>.
     * @return Boolean value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public boolean optBoolean(String key, boolean defaultValue);

    /**
     * Get the double value associated with a key.
     *
     * @param key String based key.
     * @return Double value associated with the key.
     * @throws MessageDataObjectException If the value is not a Number object and cannot be converted to a Number.
     */
    public double getDouble(String key) throws MessageDataObjectException;

    /**
     * Get an optional double value associated with a key.  It will return <code>0.0</code> if there is no such key,
     * or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Double value associated with the key, or <code>0.0</code> if no key exists or key is not proper type.
     */
    public double optDouble(String key);

    /**
     * Get an optional double value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key, or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return Double value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public double optDouble(String key, double defaultValue);
    
    /**
     * Get the float value associated with a key.
     *
     * @param key String based key.
     * @return Float value associated with the key.
     * @throws MessageDataObjectException If the value is not a Number object and cannot be converted to a Number.
     */
    public float getFloat (String key) throws MessageDataObjectException;
    
    /**
     * Get an optional float value associated with a key.  It will return <code>0.0</code> if there is no such key,
     * or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Float value associated with the key, or <code>0.0</code> if no key exists or key is not proper type.
     */
    public float optFloat (String key);
    
    /**
     * Get an optional float value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key, or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return Float value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public float optFloat (String key, float defaultValue);

    /**
     * Get the int value associated with a key.
     *
     * @param key String based key.
     * @return Int value associated with the key.
     * @throws MessageDataObjectException If the value is not a Number object and cannot be converted to a Number.
     */
    public int getInt(String key) throws MessageDataObjectException;

    /**
     * Get an optional int value associated with a key.  It will return <code>0</code> if there is no such key,
     * or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Int value associated with the key, or <code>0</code> if no key exists or key is not proper type.
     */
    public int optInt(String key);

    /**
     * Get an optional int value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key, or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return Int value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public int optInt(String key, int defaultValue);

    /**
     * Get the long value associated with a key.
     *
     * @param key String based key.
     * @return Long value associated with the key.
     * @throws MessageDataObjectException If the value is not a Number object and cannot be converted to a Number.
     */
    public long getLong(String key) throws MessageDataObjectException;

    /**
     * Get an optional long value associated with a key.  It will return <code>0</code> if there is no such key,
     * or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key String based key.
     * @return Long value associated with the key, or <code>0L</code> if no key exists or key is not proper type.
     */
    public long optLong(String key);

    /**
     * Get an optional long value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key, or if the value is not a Number object and cannot be converted to a Number.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return Long value associated with the key, or <code>defaultValue</code> if no key exists or key is not proper type.
     */
    public long optLong(String key, long defaultValue);

    /**
     * Get the String value associated with a key.
     *
     * @param key String based key.
     * @return String value associated with the key.
     * @throws MessageDataObjectException If the key is not found.
     */
    public String getString(String key) throws MessageDataObjectException;

    /**
     * Get an optional string value associated with a key.  It will return <code>""</code> (empty string) if there is no
     * such key.
     *
     * @param key String based key.
     * @return String value associated with the key, or <code>""</code> (empty string) if no key exists.
     */
    public String optString(String key);

    /**
     * Get an optional string value associated with a key.  It will return <code>defaultValue</code> if there is no such
     * key.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return String value associated with the key, or <code>defaultValue</code> if no key exists.
     */
    public String optString(String key, String defaultValue);

    /**
     * Get the IMessageDataObject list associated with a key.
     *
     * @param key String based key.
     * @return List of IMessageDataObject values.
     * @throws MessageDataObjectException If the key is not found or the value is not an IMessageDataObject list.
     */
    public IMessageDataList<IMessageDataObject> getObjectArray(String key) throws MessageDataObjectException;

    /**
     * Get the optional IMessageDataObject list associated with a key.  It will return an empty list if there is no such
     * key or the value is not an IMessageDataObject list.
     *
     * @param key String based key.
     * @return List of IMessageDataObject values or empty list if there is no such key or the value is not an IMessageDataObject list.
     */
    public IMessageDataList<IMessageDataObject> optObjectArray(String key);

    /**
     * Get the optional IMessageDataObject list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not an IMessageDataObject list.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return List of IMessageDataObject values or <code>defaultValue</code> if there is no such key or the value is not an IMessageDataObject list.
     */
    public IMessageDataList<IMessageDataObject> optObjectArray(String key, IMessageDataList<IMessageDataObject> defaultValue);

    /**
     * Get the boolean list associated with a key.
     *
     * @param key String based key.
     * @return List of boolean values.
     * @throws MessageDataObjectException If the key is not found or the value is not a boolean list.
     */
    public IMessageDataList<Boolean> getBooleanArray(String key) throws MessageDataObjectException;

    /**
     * Get the optional boolean list associated with a key.  It will return an empty list if there is no such
     * key or the value is not a boolean list.
     *
     * @param key String based key.
     * @return List of boolean values or empty list if there is no such key or the value is not a boolean list.
     */
    public IMessageDataList<Boolean> optBooleanArray(String key);

    /**
     * Get the optional boolean list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not a boolean list.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return List of boolean values or <code>defaultValue</code> if there is no such key or the value is not a boolean list.
     */
    public IMessageDataList<Boolean> optBooleanArray(String key, IMessageDataList<Boolean> defaultValue);

    /**
     * Get the double list associated with a key.
     *
     * @param key String based key.
     * @return List of double values.
     * @throws MessageDataObjectException If the key is not found or the value is not a double list.
     */
    public IMessageDataList<Double> getDoubleArray(String key) throws MessageDataObjectException;

    /**
     * Get the optional double list associated with a key.  It will return an empty list if there is no such
     * key or the value is not a double list.
     *
     * @param key String based key.
     * @return List of double values or empty list if there is no such key or the value is not a double list.
     */
    public IMessageDataList<Double> optDoubleArray(String key);

    /**
     * Get the optional double list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not a double list.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return List of double values or <code>defaultValue</code> if there is no such key or the value is not a double list.
     */
    public IMessageDataList<Double> optDoubleArray(String key, IMessageDataList<Double> defaultValue);

    /**
     * Get the int list associated with a key.
     *
     * @param key String based key.
     * @return List of int values.
     * @throws MessageDataObjectException If the key is not found or the value is not an int list.
     */
    public IMessageDataList<Integer> getIntArray(String key) throws MessageDataObjectException;

    /**
     * Get the optional int list associated with a key.  It will return an empty list if there is no such
     * key or the value is not an int list.
     *
     * @param key String based key.
     * @return List of int values or empty list if there is no such key or the value is not an int list.
     */
    public IMessageDataList<Integer> optIntArray(String key);

    /**
     * Get the optional int list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not an int list.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return List of int values or <code>defaultValue</code> if there is no such key or the value is not an int list.
     */
    public IMessageDataList<Integer> optIntArray(String key, IMessageDataList<Integer> defaultValue);

    /**
     * Get the long list associated with a key.
     *
     * @param key String based key.
     * @return List of long values.
     * @throws MessageDataObjectException If the key is not found or the value is not a long list.
     */
    public IMessageDataList<Long> getLongArray(String key) throws MessageDataObjectException;

    /**
     * Get the optional long list associated with a key.  It will return an empty list if there is no such
     * key or the value is not a long list.
     *
     * @param key String based key.
     * @return List of long values or empty list if there is no such key or the value is not a long list.
     */
    public IMessageDataList<Long> optLongArray(String key);

    /**
     * Get the optional long list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not a long list.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return List of long values or <code>defaultValue</code> if there is no such key or the value is not a long list.
     */
    public IMessageDataList<Long> optLongArray(String key, IMessageDataList<Long> defaultValue);

    /**
     * Get the String list associated with a key.
     *
     * @param key String based key.
     * @return List of String values.
     * @throws MessageDataObjectException If the key is not found or the value is not a String list.
     */
    public IMessageDataList<String> getStringArray(String key) throws MessageDataObjectException;

    /**
     * Get the optional String list associated with a key.  It will return an empty list if there is no such
     * key or the value is not a String list.
     *
     * @param key String based key.
     * @return List of String values or empty list if there is no such key or the value is not a String list.
     */
    public IMessageDataList<String> optStringArray(String key);

    /**
     * Get the optional String list associated with a key.  It will return <code>defaultValue</code> if
     * there is no such key or the value is not a String list.
     *
     * @param key          String based key.
     * @param defaultValue default value to be returned if key not found
     * @return List of String values or <code>defaultValue</code> if there is no such key or the value is not a String list.
     */
    public IMessageDataList<String> optStringArray(String key, IMessageDataList<String> defaultValue);

    /**
     * Put a key/value pair in the object.
     *
     * @param key   String based key.
     * @param value Value for this key which can be of type IMessageDataObject, boolean, double, int, long, String, or IMessageDataList.
     * @return this.
     * @throws IllegalArgumentException If the value type is not valid.
     */
    public IMessageDataObject put(String key, Object value);

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
    public Set<String> keySet();

    /**
     * Gets the class for the value associated with the particular key.
     *
     * @return class for value object associated with key or <code>null</code> if key not found
     */
    public Class getClass(String key);
}
