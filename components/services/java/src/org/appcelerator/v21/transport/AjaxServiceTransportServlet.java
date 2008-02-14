/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
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
package org.appcelerator.v21.transport;

import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageType;
import org.appcelerator.util.Util;
import org.appcelerator.v21.annotation.ServiceTransport;
import org.appcelerator.v21.dispatcher.ServiceDispatcherManager;
import org.appcelerator.v21.marshaller.ServiceMarshallerManager;

/**
 * {@link ServiceTransport} for handling incoming AJAX requests from the 
 * Appcelerator client.
 */
@ServiceTransport
public class AjaxServiceTransportServlet extends HttpServlet
{
    private static Logger LOG = Logger.getLogger(AjaxServiceTransportServlet.class);
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        // make sure we have a session
        req.getSession();
        
        // just return empty session
        resp.setHeader("Content-Length", "0");
        resp.setContentType("text/plain;charset=UTF-8");
        resp.setStatus(HttpServletResponse.SC_ACCEPTED);
        return;
    }
    
    /**
     * perform security integrity check on the request and only accept requests that
     * correctly validate the auth token check
     * 
     * @param request
     * @param response
     * @return
     * @throws ServletException
     * @throws IOException
     */
    private boolean validate(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException
    {
        HttpSession session = request.getSession();
        String instanceid = request.getParameter("instanceid");
        String auth = request.getParameter("auth");
        
        boolean failed = true;
        
        if (instanceid != null && auth != null)
        {
            String check = Util.calcMD5(session.getId()+instanceid);
            failed = !check.equals(auth);
        }
        
        
        if (failed)
        {
            response.setHeader("Content-Length", "0");
            response.setContentType("text/xml;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
        
        return !failed;
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        //
        // make sure we check the integrity of the request before we continue
        //
        if (!validate(req, resp))
        {
            LOG.error("security validation failed for request="+req+" from "+req.getRemoteAddr());
            return;
        }
        
        String type = req.getContentType();
        int idx = type.indexOf(';');
        
        if (idx < 0)
        {
            // if no specific encoding, default to UTF-8
            type = type + ";charset=UTF-8";
        }
        else
        {
            // if we have 2 ; -- trim
            idx = type.indexOf(';',idx+1);
            if (idx > 0)
            {
                type = type.substring(0,idx);
            }
        }
        
        try
        {
            // decode the incoming request
            ArrayList<Message> requests=new ArrayList<Message>();
            ArrayList<Message> responses=new ArrayList<Message>();
            
            ServiceMarshallerManager.decode(type, req.getInputStream(), requests);
            
            if (requests.isEmpty())
            {
                // no incoming messages, just return accepted header
                resp.setHeader("Content-Length", "0");
                resp.setContentType("text/plain;charset=UTF-8");
                resp.setStatus(HttpServletResponse.SC_ACCEPTED);
                return;
            }
            
            HttpSession session = req.getSession();
            InetAddress address = InetAddress.getByName(req.getRemoteAddr());
            String instanceid = req.getParameter("instanceid");

            
            for (Message request : requests)
            {
                // dispatch the message
//FIXME                request.setUser(req.getUserPrincipal());

                request.setInstanceid(instanceid);
                request.setSession(session);
                request.setSessionid(session.getId());
                request.setAddress(address);
                request.setDirection(MessageDirection.INCOMING);
                
                //FIXME => refactor this out
                if (request.getType().equals(MessageType.APPCELERATOR_STATUS_REPORT))
                {
                    IMessageDataObject data = (IMessageDataObject)request.getData();
                    data.put("remoteaddr", req.getRemoteAddr());
                    data.put("remotehost", req.getRemoteHost());
                    data.put("remoteuser", req.getRemoteUser());
                }

                ServiceDispatcherManager.dispatch(request,responses);
            }
            
            if (responses.isEmpty())
            {
                // no response messages, just return accepted header
                resp.setHeader("Content-Length", "0");
                resp.setContentType("text/plain;charset=UTF-8");
                resp.setStatus(HttpServletResponse.SC_ACCEPTED);
                return;
            }
            
            // setup the response
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setHeader("Connection", "Keep-Alive");
            resp.setHeader("Pragma", "no-cache");
            resp.setHeader("Cache-control", "no-cache, no-store, private, must-revalidate");
            resp.setHeader("Expires", "Mon, 26 Jul 1997 05:00:00 GMT");
            
            // encode the responses
            ServletOutputStream output = resp.getOutputStream();
            String responseType = ServiceMarshallerManager.encode(type, responses, output);
            resp.setContentType(responseType);
            output.flush();
        }
        catch (Throwable e)
        {
            LOG.error("Error handling incoming POST request",e);
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
