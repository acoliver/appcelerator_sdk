/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
package org.appcelerator.struts;

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
import org.apache.jasper.servlet.JspServlet;
import org.apache.struts.action.ActionServlet;
import org.appcelerator.dispatcher.ServiceDirectoryScanner;
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
public class StrutsEndpoint
{
    @SuppressWarnings("unused")
    private static final Log LOG = LogFactory.getLog(StrutsEndpoint.class);
    
    private Server server;
    
    public StrutsEndpoint(int port, String webdir)
    {
        server = new Server(port);
        Context root = new Context(server,"/",Context.SESSIONS);

        HashSessionManager sessionManager = new HashSessionManager();
        sessionManager.setUsingCookies(true);
        sessionManager.setSessionCookie("JSESSIONID");
        
        SessionHandler sh = new SessionHandler();
        sh.setSessionManager(sessionManager);
        root.setSessionHandler(sh);
        root.setResourceBase(webdir);

        
        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setResourceBase(webdir);
        root.addServlet(new ServletHolder(new DispatcherServlet(resourceHandler)),"/*");

        ActionServlet actionServlet = new ActionServlet();
        root.addServlet(new ServletHolder(actionServlet), "/servicebroker");
        root.addServlet(new ServletHolder(actionServlet), "*.do");
        
        JspServlet jspServlet = new JspServlet();
        root.addServlet(new ServletHolder(jspServlet), "*.jsp");


        //AjaxServiceTransportServlet servicebroker = new AjaxServiceTransportServlet();
		//servicebroker.setEmbeddedMode(true);
        //root.addServlet(new ServletHolder(servicebroker),"/servicebroker/*");
        
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
    
    public StrutsEndpoint start () throws Exception
    {
        server.start();
        return this;
    }
    
    public StrutsEndpoint stop () throws Exception
    {
        server.stop();
        return this;
    }
    
    public StrutsEndpoint join () throws Exception
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
        StrutsEndpoint endpoint = new StrutsEndpoint(port,webdir);
        if (servicesdir!=null)
        {
            ServiceDirectoryScanner scanner = new ServiceDirectoryScanner(new File(servicesdir),scanperiod);
            scanner.start();
        }
        endpoint.start().join();
    }
}
