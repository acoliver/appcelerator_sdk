/**
 *  Appcelerator SDK
 *  Copyright (C) 2007 by Appcelerator, Inc. All Rights Reserved.
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
package org.appcelerator.servlet.proxy;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;

import javax.servlet.ServletException;
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
import org.apache.log4j.Logger;
import org.appcelerator.servlet.dispatcher.DispatchServlet;
import org.appcelerator.util.Base64;
import org.appcelerator.util.Util;

/**
 * Cross-domain proxy servlet
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class ProxyServlet extends DispatchServlet
{
    private static final long serialVersionUID = 1L;
    private static final Logger LOG = Logger.getLogger(ProxyServlet.class);

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
            LOG.info("output array = "  + out.size());
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
        
        methodBase.setRequestHeader("User-Agent",request.getHeader("user-agent"));
        

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
