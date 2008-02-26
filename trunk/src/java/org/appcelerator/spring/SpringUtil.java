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
package org.appcelerator.spring;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.appcelerator.util.Util;

public class SpringUtil
{
    private static String replaceProperties (Properties properties, String text)
    {
        if (text.indexOf("#{")!=-1)
        {
            // replace the contents of the spring file with our properties dynamically
            for (Object key : properties.keySet())
            {
                String keyName = key.toString();
                if (!keyName.matches("\\w+\\s+\\w+"))
                {
                    String value = properties.getProperty(keyName);
                    if (value==null) value = "";
                    text = text.replaceAll("\\#\\{"+keyName.replaceAll("[.]", "\\\\.")+"\\}", value);
                }
            }
        }
        return text;
    }
    /**
     * replace #{propertyname} values in spring file from properties object
     * 
     * @param in
     * @param properties
     * @return
     * @throws IOException
     */
    public static String replaceProperties (InputStream in, Properties properties) throws IOException
    {
        // load the spring context into memory
        String springContext = Util.copyToString(in);
        
        // do multiple passes... in case properties are cyclically referencing
        for (int c=0;c<3;c++)
        {
            springContext = replaceProperties(properties,springContext);
        }
        
        return springContext;
    }
}
