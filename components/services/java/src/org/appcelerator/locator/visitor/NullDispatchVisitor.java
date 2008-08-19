/**
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.appcelerator.locator.visitor;

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.messaging.Message;

public class NullDispatchVisitor implements DispatchVisitor
{
	private static final Log LOG = LogFactory.getLog(NullDispatchVisitor.class);

	public NullDispatchVisitor() 
	{
		LOG.debug("NullDispatchVisitor created");
	}
	public void endVisit(Object obj, Message request, List<Message> responses) 
	{
	}
	public Object startVisit(Message request, List<Message> responses) 
	{
		return null;
	}
}