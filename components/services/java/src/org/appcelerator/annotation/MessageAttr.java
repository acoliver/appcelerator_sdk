
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */


package org.appcelerator.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * MessageAttr is an annotation for use with serialization of a messaging data object.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
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
