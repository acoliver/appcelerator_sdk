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

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.dispatcher.ServiceRegistry;

/**
 * DownloadTransportServlet
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class DownloadTransportServlet extends HttpServlet
{
    @SuppressWarnings("unused")
    private static final Log LOG = LogFactory.getLog(DownloadTransportServlet.class);

    private static final long serialVersionUID = 1L;
    private boolean embeddedMode;
    
    /* (non-Javadoc)
     * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)
     */
    @Override
    public void init(ServletConfig config) throws ServletException
    {
        super.init(config);

        if (this.embeddedMode)
        {
            AnnotationHelper.initializeAnnotationDBFromClasspath();
        }
        else
        {
            AnnotationHelper.initializeAnnotationDBFromServlet(config.getServletContext());
        }
    }

    /**
     * called to indicate that the class path must be used when loading annotations instead
     * of WAR lib
     */
    public void setEmbeddedMode(boolean embed)
    {
        this.embeddedMode = embed;
    }
    
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
        
		boolean handled = ServiceRegistry.dispatch(request.getSession(), ticket, name, response);
		
		if (!handled)
		{
			response.setStatus(HttpServletResponse.SC_NO_CONTENT);
		}
    }
}
