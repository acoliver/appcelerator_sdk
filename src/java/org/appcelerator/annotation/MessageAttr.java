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

/**
 * MessageAttr is an annotation for use with serialization of a messaging data object.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER})
public @interface MessageAttr
{
    /**
     * Name to be used when serialization occurs.  Defaults to field/parameter name if not specified.
     *
     * @return name to be used when serialization occurs.
     */
    String name() default "";
    
    boolean recurseSerialization() default true;
    String suppress() default "";
}
