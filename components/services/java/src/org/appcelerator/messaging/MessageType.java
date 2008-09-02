
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
 * MessageType is a representation of some basic message types.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class MessageType
{
    /**
     * MessageTypeEnum is an enumeration of basic message types.
     */
    enum MessageTypeEnum
    {
        /**
         * request sent to server with client's info
         */
        APPCELERATOR_STATUS_REPORT
    }

    /**
     * converts a message enum to a string
     *
     * @param e message type enumeration to convert
     * @return converted string
     */
    private static String convert(MessageTypeEnum e)
    {
        String name = e.name().toLowerCase();
        return name.replace('_', '.');
    }
    /**
     * request sent to server with client's info
     */
    public static final String APPCELERATOR_STATUS_REPORT = convert(MessageTypeEnum.APPCELERATOR_STATUS_REPORT);    
    
}
