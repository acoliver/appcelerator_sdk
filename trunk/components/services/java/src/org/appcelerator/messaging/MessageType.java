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

/**
 * MessageType is a representation of some basic message types.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class MessageType
{
    /**
     * MessageTypeEnum is an enumeration of basic message types.
     */
    enum MessageTypeEnum
    {
        /**
         * request sent to server with client's info
         */
        APPCELERATOR_STATUS_REPORT
    }

    /**
     * converts a message enum to a string
     *
     * @param e message type enumeration to convert
     * @return converted string
     */
    private static String convert(MessageTypeEnum e)
    {
        String name = e.name().toLowerCase();
        return name.replace('_', '.');
    }
    /**
     * request sent to server with client's info
     */
    public static final String APPCELERATOR_STATUS_REPORT = convert(MessageTypeEnum.APPCELERATOR_STATUS_REPORT);    
    
}
