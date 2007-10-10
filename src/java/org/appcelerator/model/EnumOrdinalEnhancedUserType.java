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

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.EnumSet;
import java.util.Properties;

import org.hibernate.HibernateException;
import org.hibernate.usertype.EnhancedUserType;
import org.hibernate.usertype.ParameterizedType;

/**
 * EnumOrdinalEnhancedUserType - this class allows persisting of enum types.  This is adopted from
 * http://www.hibernate.org/312.html and according to posts originally written by Gavin King and modified for
 * smallint/ordinal mapping by "crgardner".
 *
 * This class has been updated to work properly in spring via class loading of the enumerated class name.  To work
 * with annotations, use the following:
 *
 * @Type(type = "org.appcelerator.model.EnumOrdinalEnhancedUserType", parameters =
 *          {@Parameter(
 *                        name = "enumClassName",
 *                        value = "yourpackage.yourEnumClass"
 *          )})
 *
 * This class uses the enum ordinal and persists as a smallint in the database, therefore re-ordering the declaration
 * of the elements in the enumeration will void those entries stored in the db.  If re-ordering is required, use
 * EnumNameEnhancedUserType.
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 * @see org.appcelerator.model.EnumNameEnhancedUserType
 */
public class EnumOrdinalEnhancedUserType implements EnhancedUserType, ParameterizedType
{
    private Class<Enum> enumClass;

    @SuppressWarnings("unchecked")
    public void setParameterValues(Properties parameters)
    {
        String enumClassName = parameters.getProperty("enumClassName");
        try
        {
            enumClass = (Class<Enum>) Thread.currentThread().getContextClassLoader().loadClass(enumClassName);
        }

        catch (ClassNotFoundException squash)
        {
            try
            {
                enumClass = (Class<Enum>) getClass().getClassLoader().loadClass(enumClassName);
            }
            catch (ClassNotFoundException classNotFoundException)
            {
                throw new HibernateException("Enum class not found", classNotFoundException);
            }
        }
    }

    public Object assemble(Serializable cached, Object owner) throws HibernateException
    {
        return cached;
    }

    public Object deepCopy(Object value) throws HibernateException
    {
        return value;
    }

    public Serializable disassemble(Object value) throws HibernateException
    {
        return (Enum) value;
    }

    public boolean equals(Object x, Object y) throws HibernateException
    {
        return x == y;
    }

    public int hashCode(Object x) throws HibernateException
    {
        return x.hashCode();
    }

    public boolean isMutable()
    {
        return false;
    }

    @SuppressWarnings("unchecked")
    public Object nullSafeGet(ResultSet rs, String[] names, Object owner) throws HibernateException, SQLException
    {
        int ordinal = rs.getInt(names[0]);

        //Don't know if we are guaranteed to get the ordinals
        //in the right order with toArray() below.
        return rs.wasNull() ? null : EnumSet.allOf(enumClass).toArray()[ordinal];
    }

    public void nullSafeSet(PreparedStatement st, Object value, int index) throws HibernateException, SQLException
    {
        if (value == null)
        {
            st.setNull(index, Types.INTEGER);
        }
        else
        {
            st.setInt(index, ((Enum) value).ordinal());
        }
    }

    public Object replace(Object original, Object target, Object owner) throws HibernateException
    {
        return original;
    }

    public Class returnedClass()
    {
        return enumClass;
    }

    public int[] sqlTypes()
    {
        return new int[]{Types.INTEGER};
    }

    @SuppressWarnings("unchecked")
    public Object fromXMLString(String xmlValue)
    {
        return Enum.valueOf(enumClass, xmlValue);
    }

    public String objectToSQLString(Object value)
    {
        return new StringBuffer(((Enum) value).ordinal()).toString();
    }

    public String toXMLString(Object value)
    {
        return objectToSQLString(value);
    }
}

