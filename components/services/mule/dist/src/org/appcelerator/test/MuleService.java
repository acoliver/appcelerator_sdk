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
package org.appcelerator.test;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;

public class MuleService
{
    public String echo(String echo)
    {
        
        /* this message will be converted to 
           JSON using the XML to JSON transformer */
        return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
                + "<messages>"
                + " <message>I received from you: " + echo + "</message>"
                + " <message>one</message>"
                + " <message>two</message>"
                + " <message>three</message>"
                + " <message>four</message>"
                + "</messages>";
    }

}
