
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
 * Service annotation
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Service
{
    /**
     * service request name
     * 
     * @return
     */
    String request();
    
    /**
     * service response name or null/empty string for no response
     * 
     * @return
     */
    String response() default "";
    
    /**
     * service version (defaults to 1.0)
     * 
     * @return
     */
    String version() default "1.0";

	/** 
	 * method which will be invoked before the service is handled. 	the method must take two
	 * parameters of Message type. The first is the incoming message, the second is the outgoing response.
	 */
    String premessage() default "";

	/** 
	 * method which will be invoked after the service is handled. the method must take two
	 * parameters of Message type. The first is the incoming message, the second is the outgoing response.
	 */
    String postmessage() default "";

    /** 
	 * method which will be invoked after the service is handled when an exception occurs. the method signature is (Message request, Message response, Throwable e)
	 */
    String postmessageException() default "";
}
