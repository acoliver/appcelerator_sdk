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
package org.appcelerator;

import org.appcelerator.util.TimeUtil;
import org.springframework.web.context.WebApplicationContext;


/**
 * Collection of constants.
 *
 * @author <a href="mailto:nwright@hakano.com">Nolan Wright</a>
 */
public class Constants
{
    // session variables
    public static final String BEAN_FACTORY = WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE;

    public static final String USER = "appcelerator.user";
    public static final String SESSION_RESTORED = "appcelerator.session.restored";
    public static final String SESSION_RELOADED = "appcelerator.session.reloaded";
    public static final String SESSION_EXPIRED = "appcelerator.session.expired";
    public static final String SESSION_USER_CHANGE = "appcelerator.session.userchange";

    public static final int SESSION_TIMEOUT__IN_SECONDS = ((int) (TimeUtil.ONE_MINUTE * 2) / 1000);
}
