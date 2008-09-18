
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

package org.appcelerator.locator.visitor;

import java.util.List;

import org.appcelerator.messaging.Message;

/**
 * interface that implements visitor pattern for hooking into dispatching of services
 */
public interface DispatchVisitor 
{
	/**
	 * called before the dispatch happens
	 */
	public Object startVisit(Message request, List<Message> responses);
	
	/**
	 * called after the dispatch happens
	 */
	public void endVisit(Object obj, Message request, List<Message> responses);
}
