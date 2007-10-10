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
package org.appcelerator.model;

import org.appcelerator.annotation.MessageAttr;
import org.appcelerator.json.JSONString;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.IMessageDataString;
import org.appcelerator.messaging.MessageDataSerializer;

/**
 * AbstractModelObject is used as a base for model objects and assists with persistence and serialization for messaging.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public abstract class AbstractModelObject implements IMessageDataString, JSONString, IModelObject
{
    private transient String toStringValue;
    private transient String shortClassName;
    private transient String dataobj;

    @MessageAttr
    private Long id;

    /**
     * get the identifier for this object
     *
     * @return the id
     */
    public Long getId()
    {
        return id;
    }

    /**
     * set the identifier for this object
     *
     * @param id the identifier
     */
    public void setId(Long id)
    {
        this.id = id;
    }

    /**
     * The <code>toJSONString</code> method allows a class to produce its own JSON
     * serialization.
     *
     * @return A strictly syntactically correct JSON text.
     */
    public String toJSONString()
    {
        return toDataString();
    }

    /**
     * Convert the object to a serializable String based representation.
     *
     * @return serializable String representation of the object.
     */
    public String toDataString()
    {
        // if transient, we don't cache
        if (isMessageDataObjectTransient())
        {
            return MessageDataSerializer.serialize(this).toDataString();
        }
        // otherwise, not transient, fetch and cache (if not already fetched)
        // to save on processing power
        if (dataobj == null)
        {
            IMessageDataObject _dataobj = MessageDataSerializer.serialize(this);
            // give the subclass a short w/o having to have them
            // re-duplicate or even worse, reparse it
            populateMessageDataObject(_dataobj);
            dataobj = _dataobj.toDataString();
        }
        return dataobj;
    }

    /**
     * return true if you don't want the value of toDataString to be
     * cached and re-used on subsequent method calls
     *
     * @return <code>true</code> is the object is transient, <code>false</code> otherwise
     */
    protected boolean isMessageDataObjectTransient()
    {
        return true;
    }

    /**
     * allow a subclass to add additional info to the data string
     * <p/>
     * This is a template method
     *
     * @param obj message data object to populate
     */
    protected void populateMessageDataObject(IMessageDataObject obj)
    {
    }

    /**
     * default toString representation is the value of the message data string
     */
    @Override
    public String toString()
    {
        if (shortClassName == null)
        {
            Class clz = getClass();
            int idx = clz.getName().lastIndexOf('.');
            shortClassName = (idx != -1) ? clz.getName().substring(idx + 1) : clz.getName();
        }

        if (isMessageDataObjectTransient())
        {
            return "[" + shortClassName + "->" + toDataString() + "]";
        }

        if (toStringValue == null)
        {
            toStringValue = "[" + shortClassName + "->" + toDataString() + "]";
        }
        return toStringValue;
    }

    /**
     * Indicates whether some other object is "equal to" this one.
     * <p/>
     * The <code>equals</code> method implements an equivalence relation
     * on non-null object references:
     * <ul>
     * <li>It is <i>reflexive</i>: for any non-null reference value
     * <code>x</code>, <code>x.equals(x)</code> should return
     * <code>true</code>.
     * <li>It is <i>symmetric</i>: for any non-null reference values
     * <code>x</code> and <code>y</code>, <code>x.equals(y)</code>
     * should return <code>true</code> if and only if
     * <code>y.equals(x)</code> returns <code>true</code>.
     * <li>It is <i>transitive</i>: for any non-null reference values
     * <code>x</code>, <code>y</code>, and <code>z</code>, if
     * <code>x.equals(y)</code> returns <code>true</code> and
     * <code>y.equals(z)</code> returns <code>true</code>, then
     * <code>x.equals(z)</code> should return <code>true</code>.
     * <li>It is <i>consistent</i>: for any non-null reference values
     * <code>x</code> and <code>y</code>, multiple invocations of
     * <tt>x.equals(y)</tt> consistently return <code>true</code>
     * or consistently return <code>false</code>, provided no
     * information used in <code>equals</code> comparisons on the
     * objects is modified.
     * <li>For any non-null reference value <code>x</code>,
     * <code>x.equals(null)</code> should return <code>false</code>.
     * </ul>
     * <p/>
     * The <tt>equals</tt> method for class <code>Object</code> implements
     * the most discriminating possible equivalence relation on objects;
     * that is, for any non-null reference values <code>x</code> and
     * <code>y</code>, this method returns <code>true</code> if and only
     * if <code>x</code> and <code>y</code> refer to the same object
     * (<code>x == y</code> has the value <code>true</code>).
     * <p/>
     * Note that it is generally necessary to override the <tt>hashCode</tt>
     * method whenever this method is overridden, so as to maintain the
     * general contract for the <tt>hashCode</tt> method, which states
     * that equal objects must have equal hash codes.
     *
     * @param obj the reference object with which to compare.
     * @return <code>true</code> if this object is the same as the obj
     *         argument; <code>false</code> otherwise.
     * @see #hashCode()
     * @see java.util.Hashtable
     */
    @Override
    public boolean equals(Object obj)
    {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;

        final AbstractModelObject that = (AbstractModelObject) obj;

        return !(id != null ? !id.equals(that.id) : that.id != null);
    }

    /**
     * Returns a hash code value for the object. This method is
     * supported for the benefit of hashtables such as those provided by
     * <code>java.util.Hashtable</code>.
     * <p/>
     * The general contract of <code>hashCode</code> is:
     * <ul>
     * <li>Whenever it is invoked on the same object more than once during
     * an execution of a Java application, the <tt>hashCode</tt> method
     * must consistently return the same integer, provided no information
     * used in <tt>equals</tt> comparisons on the object is modified.
     * This integer need not remain consistent from one execution of an
     * application to another execution of the same application.
     * <li>If two objects are equal according to the <tt>equals(Object)</tt>
     * method, then calling the <code>hashCode</code> method on each of
     * the two objects must produce the same integer result.
     * <li>It is <em>not</em> required that if two objects are unequal
     * according to the {@link java.lang.Object#equals(java.lang.Object)}
     * method, then calling the <tt>hashCode</tt> method on each of the
     * two objects must produce distinct integer results.  However, the
     * programmer should be aware that producing distinct integer results
     * for unequal objects may improve the performance of hashtables.
     * </ul>
     * <p/>
     * As much as is reasonably practical, the hashCode method defined by
     * class <tt>Object</tt> does return distinct integers for distinct
     * objects. (This is typically implemented by converting the internal
     * address of the object into an integer, but this implementation
     * technique is not required by the
     * Java<font size="-2"><sup>TM</sup></font> programming language.)
     *
     * @return a hash code value for this object.
     * @see java.lang.Object#equals(java.lang.Object)
     * @see java.util.Hashtable
     */
    @Override
    public int hashCode()
    {
        return (id != null ? id.hashCode() : 0);
    }
}
