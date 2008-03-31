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
package org.appcelerator.transport;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.appcelerator.dispatcher.ServiceRegistry;

/**
 * DownloadTransportServlet
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class DownloadTransportServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;
    private static final Log LOG = LogFactory.getLog(DownloadTransportServlet.class);

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
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
        
		boolean handled = ServiceRegistry.getInstance().dispatch(request.getSession(), ticket, name, response);
		
		if (!handled)
		{
			response.setStatus(HttpServletResponse.SC_NO_CONTENT);
		}
    }
}
