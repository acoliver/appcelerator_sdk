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

/**
 * MessageType is a representation of some basic message types.
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class MessageType
{
    /**
     * MessageTypeEnum is an enumeration of basic message types.
     */
    enum MessageTypeEnum
    {
        /**
         * request sent to server when a user attempts to login
         */
        APP_USER_LOGIN_REQUEST,
        /**
         * response sent from server with results of a user login attempt
         */
        APP_USER_LOGIN,
        /**
         * request sent to server to update user login seed/challenge
         */
        APP_LOGIN_SEED_REQUEST,
        /**
         * response sent from server with results of user login seed/challenge
         */
        APP_LOGIN_SEED,
        /**
         * request sent to server when a user attempts to logout
         */
        APP_USER_LOGOUT_REQUEST,
        /**
         * response sent from server with results of a user logout attempt
         */
        APP_USER_LOGOUT,
        /**
         * request sent to server with client's info
         */
        APP_STATUS_REPORT
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
     * request sent to server when a user attempts to login
     */
    public static final String APP_USER_LOGIN_REQUEST = convert(MessageTypeEnum.APP_USER_LOGIN_REQUEST);
    /**
     * response sent from server with results of a user login attempt
     */
    public static final String APP_USER_LOGIN = convert(MessageTypeEnum.APP_USER_LOGIN);
    /**
     * request sent to server to update user login seed/challenge
     */
    public static final String APP_LOGIN_SEED_REQUEST = convert(MessageTypeEnum.APP_LOGIN_SEED_REQUEST);
    /**
     * response sent from server with results of user login seed/challenge
     */
    public static final String APP_LOGIN_SEED = convert(MessageTypeEnum.APP_LOGIN_SEED);
    /**
     * request sent to server when a user attempts to logout
     */
    public static final String APP_USER_LOGOUT_REQUEST = convert(MessageTypeEnum.APP_USER_LOGOUT_REQUEST);
    /**
     * response sent from server with results of a user logout attempt
     */
    public static final String APP_USER_LOGOUT = convert(MessageTypeEnum.APP_USER_LOGOUT);
    /**
     * request sent to server with client's info
     */
    public static final String APP_STATUS_REPORT = convert(MessageTypeEnum.APP_STATUS_REPORT);    
    
}
