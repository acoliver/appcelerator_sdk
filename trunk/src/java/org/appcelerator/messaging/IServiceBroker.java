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
 * IServiceBroker is the generic interface used for subscribing and sending
 * to appcelerator messages.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public interface IServiceBroker 
{
	/**
	 * unregister a listener
	 *
	 * @param listener listener to unregister
	 * @return <code>true</code> if listener was unregistered, <code>false</code> otherwise
	 */
	public abstract boolean unregisterListener(IServiceListener listener);

	/**
	 * register a listener
	 *
	 * @param listener listener to register
	 * @return <code>true</code> if the listener was successfully registered, <code>false</code> otherwise
	 */
	public abstract boolean registerListener(IServiceListener listener);

	/**
	 * put a message in the queue for processing
	 *
	 * @param message message to dispatch thru the queue for processing
	 */
	public abstract void dispatch(Message message, Runnable callback);
}