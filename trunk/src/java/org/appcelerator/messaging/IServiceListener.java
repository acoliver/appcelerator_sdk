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

import java.util.List;

/**
 * IServiceListener interface is implemented by objects that want to be able to filter and receive messaging layer
 * messages.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public interface IServiceListener
{
    /**
     * called to filter messages
     *
     * @param message message to determine willingness to accept
     * @return <code>true</code> to accept the message, <code>false</code> otherwise
     */
    public boolean accept(Message message);
    
    /**
     * return a list of service types that this listener desires to receive
     * 
     * @return
     */
    public List<String> getServiceTypes ();

    /**
     * called when a message is received by the broker
     *
     * @param message previously accepted message which is now ready for proceessing
     */
    public void onMessage(Message message);
}
