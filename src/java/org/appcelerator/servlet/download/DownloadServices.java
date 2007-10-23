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
package org.appcelerator.servlet.download;

import java.lang.reflect.Method;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.util.GUID;

public class DownloadServices
{
    private static final Map<String,DownloadService> services = Collections.synchronizedMap(new HashMap<String,DownloadService>());
    
    private final static class DownloadService
    {
        private final Object service;
        private final Method method;
        
        DownloadService(final Object service, final Method method)
        {
            super();
            this.service = service;
            this.method = method;
        }
    }
    
    /**
     * queue a download message back to the client
     * 
     * @param messageReference
     * @param service
     * @param ticket
     */
    public static void queue (Message messageReference, String service, String ticket)
    {
        Message msg = MessageUtils.createResponseMessage(messageReference);
        if (ticket == null)
        {
            // we need a ticket no matter what
            ticket = GUID.asGUID();
        }
        IMessageDataObject data = MessageUtils.createMessageDataObject();
        data.put("ticket", ticket);
        data.put("name", service);
        msg.setData(data);
        msg.setType("appcelerator.download");
        // queue the new message
        messageReference.getBroker().dispatch(msg,null);
    }
    
    public static void register (String name, Object service, Method method)
    {
        services.put(name, new DownloadService(service,method));
    }
    
    public static void dispatch (HttpServletRequest request, HttpServletResponse response) throws Exception
    {
        String ticket = request.getParameter("ticket");
        if (ticket==null)
        {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST,"ticket required to use this service");
            return;
        }
        String name = request.getParameter("name");
        if (name==null)
        {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST,"name required to use this service");
            return;
        }
        
        HttpSession session = request.getSession();
        
        DownloadService service = services.get(name);
        if (service==null)
        {
            response.sendError(HttpServletResponse.SC_NOT_FOUND,"no service with that name found");
            return;
        }
        // delegate to the actual service method
        service.method.invoke(service.service, new Object[]{ticket,session,response});
    }
}
