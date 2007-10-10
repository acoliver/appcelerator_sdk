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
import java.util.Properties;

import org.hibernate.HibernateException;
import org.hibernate.usertype.EnhancedUserType;
import org.hibernate.usertype.ParameterizedType;

/**
 * EnumNameEnhancedUserType - this class allows persisting of enum types.  This is adopted from
 * http://www.hibernate.org/272.html was originally written by Gavin King.
 *
 * This class has been updated to work properly in spring via class loading of the enumerated class name.  To work
 * with annotations, use the following:
 *
 * @Type(type = "org.appcelerator.model.EnumNameEnhancedUserType", parameters =
 *          {@Parameter(
 *                        name = "enumClassName",
 *                        value = "yourpackage.yourEnumClass"
 *          )})
 *
 * This class uses the enum value name and persists as a varchar in the database, therefore re-ordering the declaration
 * of the elements in the enumeration is allowed.  If re-ordering is not required, consider using
 * EnumOrdinalEnhancedUserType for quicker use and smaller storage requirements.
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 * @see org.appcelerator.model.EnumOrdinalEnhancedUserType
 */
public class EnumNameEnhancedUserType implements EnhancedUserType, ParameterizedType
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
        String name = rs.getString(names[0]);
        return rs.wasNull() ? null : Enum.valueOf(enumClass, name);
    }

    public void nullSafeSet(PreparedStatement st, Object value, int index) throws HibernateException, SQLException
    {
        if (value == null)
        {
            st.setNull(index, Types.VARCHAR);
        }
        else
        {
            st.setString(index, ((Enum) value).name());
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
        return new int[]{Types.VARCHAR};
    }

    @SuppressWarnings("unchecked")
    public Object fromXMLString(String xmlValue)
    {
        return Enum.valueOf(enumClass, xmlValue);
    }

    public String objectToSQLString(Object value)
    {
        return '\'' + ((Enum) value).name() + '\'';
    }

    public String toXMLString(Object value)
    {
        return ((Enum) value).name();
    }
}
