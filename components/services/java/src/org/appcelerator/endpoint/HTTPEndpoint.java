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
package org.appcelerator.endpoint;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.dispatcher.ServiceDirectoryScanner;
import org.appcelerator.transport.AjaxServiceTransportServlet;
import org.appcelerator.transport.DownloadTransportServlet;
import org.appcelerator.transport.ProxyTransportServlet;
import org.appcelerator.transport.UploadTransportServlet;
import org.mortbay.jetty.MimeTypes;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.handler.ResourceHandler;
import org.mortbay.jetty.servlet.Context;
import org.mortbay.jetty.servlet.HashSessionManager;
import org.mortbay.jetty.servlet.ServletHolder;
import org.mortbay.jetty.servlet.SessionHandler;
import org.mortbay.resource.Resource;

/**
 * HTTPEndpoint is a class which implements a partial Jetty embedded webserver
 * for running the environment without the need for an external webserver.  Perfect
 * for development mode.
 */
public class HTTPEndpoint
{

    @SuppressWarnings("unused")
    private static final Log LOG = LogFactory.getLog(HTTPEndpoint.class);
    
    private Server server;
    
    public HTTPEndpoint(int port, String webdir)
    {
        server = new Server(port);
        
        ResourceHandler resourceHandler=new ResourceHandler();
        resourceHandler.setResourceBase(webdir);
        
        SessionHandler sh = new SessionHandler();
        HashSessionManager sessionManager=new HashSessionManager();
        sessionManager.setUsingCookies(true);
        sessionManager.setSessionCookie("JSESSIONID");
        sh.setSessionManager(sessionManager);
        
        Context root = new Context(server,"/",Context.SESSIONS);
        root.setSessionHandler(sh);
        root.addServlet(new ServletHolder(new DispatcherServlet(resourceHandler)),"/*");

        AjaxServiceTransportServlet servicebroker = new AjaxServiceTransportServlet();
		servicebroker.setEmbeddedMode(true);
        root.addServlet(new ServletHolder(servicebroker),"/servicebroker/*");
        
        ProxyTransportServlet proxy = new ProxyTransportServlet();
        proxy.setEmbeddedMode(true);
        root.addServlet(new ServletHolder(proxy),"/proxy/*");
        
        DownloadTransportServlet download = new DownloadTransportServlet();
        download.setEmbeddedMode(true);
        root.addServlet(new ServletHolder(download),"/download/*");
        
        UploadTransportServlet upload = new UploadTransportServlet();
        upload.setEmbeddedMode(true);
        root.addServlet(new ServletHolder(upload),"/upload/*");
        
        server.setGracefulShutdown(2000);
        server.setStopAtShutdown(true);
    }
    
    private static class DispatcherServlet extends HttpServlet
    {
        private static final long serialVersionUID = 1L;
        private final ResourceHandler resourceHandler;
        private final MimeTypes mimeTypes = new MimeTypes();
        
        DispatcherServlet(ResourceHandler rh)
        {
            resourceHandler = rh;
        }
        protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
        {
            // make sure cookies are working for all files
            request.getSession(true);
            
            String path = request.getPathInfo();
            if (path==null || path.equals("/"))
            {
                path = "/index.html";
            }

            Resource resource=resourceHandler.getResource(path);
            if (resource.exists() && !resource.isDirectory())
            {
               
                response.setContentLength((int) resource.length());
                response.setContentType(mimeTypes.getMimeByExtension(path).toString());

                OutputStream out = response.getOutputStream();
                InputStream in = resource.getInputStream();
                byte buf[] = new byte[8096];
                int count = 0;
                while (true)
                {
                    int c = in.read(buf);
                    if (c<0)
                    {
                        break;
                    }
                    out.write(buf,0,c);
                    count+=c;
                }
                out.flush();
               
                return;
            }
            
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
    
    public HTTPEndpoint start () throws Exception
    {
        server.start();
        return this;
    }
    
    public HTTPEndpoint stop () throws Exception
    {
        server.stop();
        return this;
    }
    
    public HTTPEndpoint join () throws Exception
    {
        server.join();
        return this;
    }
    
    /**
     * @param args
     */
    public static void main(String[] args) throws Exception
    {
        if (args.length!=4 && args.length!=2)
        {
            System.err.println("HTTPEndpoint <port> <webdir> <services_dir> <scan_period>");
            System.exit(1);
        }
        int port = Integer.parseInt(args[0]);
        String webdir = args[1];
        String servicesdir = args.length > 2 ? args[2] : null;
        long scanperiod = args.length > 3 ? Long.parseLong(args[3]) : 5000;
        HTTPEndpoint endpoint = new HTTPEndpoint(port,webdir);
        if (servicesdir!=null)
        {
            ServiceDirectoryScanner scanner = new ServiceDirectoryScanner(new File(servicesdir),scanperiod);
            scanner.start();
        }
        endpoint.start().join();
    }
}
