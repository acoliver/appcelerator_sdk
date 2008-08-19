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
package org.appcelerator.transport;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethodBase;
import org.apache.commons.httpclient.methods.ByteArrayRequestEntity;
import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.OptionsMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.PutMethod;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.util.Base64;
import org.appcelerator.util.Util;

/**
 * Cross-domain proxy servlet
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class ProxyTransportServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;
    private static final Log LOG = LogFactory.getLog(ProxyTransportServlet.class);

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
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        String method = request.getMethod();
        String url = request.getParameter("url");
        if (url==null)
        {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        url = URLDecoder.decode(url,"UTF-8");
        
        if (url.indexOf("://")==-1)
        {
            url = new String(Base64.decode(url));
        }

        HttpClient client = new HttpClient();
        HttpMethodBase methodBase = null;
        
        if (method.equalsIgnoreCase("POST"))
        {
            methodBase = new PostMethod(url);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Util.copy(request.getInputStream(), out);
            ByteArrayRequestEntity req = new ByteArrayRequestEntity(out.toByteArray());
            ((PostMethod)methodBase).setRequestEntity(req);
        }
        else if (method.equalsIgnoreCase("GET"))
        {
            methodBase = new GetMethod(url);
            methodBase.setFollowRedirects(true);      
        }
        else if (method.equalsIgnoreCase("PUT"))
        {
            methodBase = new PutMethod(url);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Util.copy(request.getInputStream(), out);
            ByteArrayRequestEntity req = new ByteArrayRequestEntity(out.toByteArray());
            ((PutMethod)methodBase).setRequestEntity(req);
        }
        else if (method.equalsIgnoreCase("DELETE"))
        {
            methodBase = new DeleteMethod(url);
        }
        else if (method.equalsIgnoreCase("OPTIONS"))
        {
            methodBase = new OptionsMethod(url);
        }
        
        methodBase.setRequestHeader("User-Agent",request.getHeader("user-agent") + " (Appcelerator Proxy)");
        

        if (LOG.isDebugEnabled())
        {
            LOG.debug("Proxying url: "+url+", method: "+method);
        }
        
        int status = client.executeMethod(methodBase);
        
        response.setStatus(status);
        response.setContentLength((int)methodBase.getResponseContentLength());
        
        for (Header header : methodBase.getResponseHeaders())
        {
            String name = header.getName();
            if (name.equalsIgnoreCase("Set-Cookie")==false && name.equals("Transfer-Encoding")==false)
            {
                response.setHeader(name, header.getValue());
            }
        }
        InputStream in = methodBase.getResponseBodyAsStream();
        Util.copy(in, response.getOutputStream());
    }
}
