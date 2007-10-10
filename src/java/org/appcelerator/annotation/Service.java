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
package org.appcelerator.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.appcelerator.messaging.MessageDirection;

/**
 * Service is an annotation to indicate a method is responsible for handling a particular request message and
 * optionally replies with a particular response.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.PARAMETER})
public @interface Service
{
    /**
     * Message request type represented as String, for example app.user.request or pattern app.user.*
     *
     * @return message request type
     */
    String request();

    /**
     * Message response type represented as String, for example app.user in response to a app.user.request.
     * Defaults to "" (empty string) which designates no response.
     *
     * @return message response type
     */
    String response() default "";

    /**
     * Indicates whether authentication (logged in user) is required for the message.
     *
     * @return <code>true</code> if authentication required, <code>false</code> otherwise
     */
    boolean authenticationRequired() default true;

    /**
     * Direction for request message, defaults to <code>MessageDirection.INCOMING</code>.
     *
     * @return direction for request message
     */
    MessageDirection requestDirection() default MessageDirection.INCOMING;

    /**
     * Direction for response message, defaults to <code>MessageDirection.OUTGOING</code>.
     *
     * @return direction for response message
     */
    MessageDirection responseDirection() default MessageDirection.OUTGOING;
    
    /**
     * return the service version
     * 
     * @return
     */
    String version () default "1.0";
}
