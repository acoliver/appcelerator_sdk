/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
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
package org.appcelerator.v21.marshaller;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

import org.appcelerator.messaging.Message;
import org.appcelerator.v21.annotation.ServiceMarshaller;

/**
 * Marshaller for encoding and decoding incoming/outgoing JSON messages.
 */
public class JSONMarshaller
{
    @ServiceMarshaller(contentTypes="text/json;charset=UTF-8",direction=ServiceMarshaller.Direction.DECODE)
    public void decode (InputStream input, List<Message> messages)
    {
    }
    
    @ServiceMarshaller(contentTypes="text/json;charset=UTF-8",direction=ServiceMarshaller.Direction.ENCODE)
    public String encode (List<Message> messages, OutputStream in)
    {
        return null;
    }
}
