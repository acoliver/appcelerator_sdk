
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
package org.appcelerator.messaging;

/**
 * MessageDirection is an enumeration of directions the message can flow in.
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public enum MessageDirection
{
    /**
     * message is incoming from a server perspective
     */
    INCOMING,
    /**
     * message is outgoing from a server perspective
     */
    OUTGOING,
    /**
     * message is any perspective
     */    
    ANY
}
