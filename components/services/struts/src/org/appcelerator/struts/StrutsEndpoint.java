
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
import org.appcelerator.locator.ServiceDirectoryScanner;
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
 * StrutsEndpoint is a Jetty endpoint which can handle Appcelerator messages
 * with Struts services.
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
