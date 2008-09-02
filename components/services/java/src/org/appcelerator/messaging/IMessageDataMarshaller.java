
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
 * IMessageDataMarshaller allows you to provide custom serialization for an object that is contained in a
 * IMessageDataObject container.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public interface IMessageDataMarshaller<T>
{
    /**
     * marshal the T and place it in container (if you want it to be serialized and transported)
     *
     * @param t         object to marshall
     * @param container container for marshalled object
     */
    public void marshal(T t, IMessageDataObject container);
}
