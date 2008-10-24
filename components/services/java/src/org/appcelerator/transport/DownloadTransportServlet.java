
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
import org.appcelerator.service.ServiceRegistry;

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
        ServiceRegistry.intialize(config.getServletContext());
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
        
		boolean handled = ServiceRegistry.dispatch(request, ticket, name, response);
		
		if (!handled)
		{
			response.setStatus(HttpServletResponse.SC_NO_CONTENT);
		}
    }
}
