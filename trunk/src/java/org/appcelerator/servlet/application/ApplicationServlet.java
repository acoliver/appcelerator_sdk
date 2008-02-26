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
package org.appcelerator.servlet.application;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.appcelerator.Constants;
import org.appcelerator.deployment.ApplicationDeployer;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.util.Util;
import org.springframework.beans.factory.ListableBeanFactory;


/**
 * Application Dispatcher Servlet
 * 
 * @author jhaynie
 */
public class ApplicationServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;
    private static final Logger LOG = Logger.getLogger(ApplicationServlet.class);

    private ApplicationDeployer applicationDeployer;
    private List<IApplicationStatsFilter> statsFilters = new ArrayList<IApplicationStatsFilter>();

    
    @Override
    public void init(ServletConfig config) throws ServletException
    {
        super.init(config);
        ListableBeanFactory factory = (ListableBeanFactory) config.getServletContext().getAttribute(Constants.BEAN_FACTORY);
        applicationDeployer = (ApplicationDeployer)factory.getBean("applicationDeployer",ApplicationDeployer.class);
        
        String filters[]=factory.getBeanNamesForType(IApplicationStatsFilter.class);
        if (filters!=null && filters.length>0)
        {
            for (String name : filters)
            {
               statsFilters.add((IApplicationStatsFilter)factory.getBean(name, IApplicationStatsFilter.class));
            }
        }
    }
    
    private final class Route
    {
        private String appname;
        private String version;
        private String path;
        private String resource;
        
        Route(String appname, String version, String path,
                String resource)
        {
            this.appname = appname;
            this.version = version;
            this.path = path;
            this.resource = resource;
        }
    }

    private Route route (HttpServletRequest req, HttpServletResponse response) throws IOException, ServletException
    {
        String pathInfo = req.getPathInfo();
        
        if (pathInfo==null || pathInfo.length()==0 || pathInfo.charAt(0)!='/')
        {
            if (response!=null) response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return null;
        }
        pathInfo = pathInfo.substring(1);
        String tokens[] = pathInfo.split("/");
        if (tokens.length < 2)
        {
            LOG.warn(pathInfo+" doesn't match minimum number of tokens");
            return null;
        }
        String appname = tokens[0];
        String version = tokens[1];
        if (false == ApplicationDeployer.RELEASE_REGEX.matcher(version).matches())
        {
            LOG.warn("incoming version: "+version+" didn't pass version pattern check");
            if (response!=null) response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return null;
        }
        
        // if we're asking for the latest, figure out what that is...
        if (version.equals("current") || version.equals("latest"))
        {
            version = applicationDeployer.getCurrentVersion(appname).toString();
        }
        
        // build the remaining path to the file
        String path = Util.join(tokens, "/", 2);
        if (path==null || path.equals(""))
        {
            if (response!=null) response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return null;
        }

        if (LOG.isDebugEnabled())
        {
            LOG.debug("appname ["+appname+"] version ["+version+"] path ["+path+"]");
        }
        
        // if we get the servicebroker, return it
        if (path.equals("-/servicebroker"))
        {
            response.setStatus(HttpServletResponse.SC_OK);
            getServletContext().getRequestDispatcher("/-/servicebroker").forward(req, response);
            return null;
        }
        
        String resource = "/WEB-INF/apps/releases/"+appname+"/"+version+"/"+path;

        if (!applicationDeployer.getAuthorization(req.getSession(),appname,version,"/"+path))
        {
            if (response!=null) response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return null;
        }

        // now the real mcoy
        return new Route(appname,version,path,resource);
    }
    
    private File getRealPath (HttpServletRequest req, String path)
    {
        String realpath = getServletContext().getRealPath(path);
        File f = new File(realpath);
        
        if (!f.exists())
        {
            return null;
        }
        
        return f;
    }
    
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        Route route = route(req,resp);
        if (route==null)
        {
            return;
        }
        super.doPost(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        Route route = route(req,resp);
        if (route==null)
        {
            return;
        }
        File file = getRealPath(req,route.resource);
        if (file==null)
        {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        // set the default and forward
        long ts = System.currentTimeMillis();
        resp.setStatus(HttpServletResponse.SC_OK);
        RequestDispatcher dispatcher = req.getRequestDispatcher(route.resource);
        dispatcher.forward(req, resp);
        long duration = System.currentTimeMillis()-ts;
        doStatsFilter(req,route,resp,duration);
    }

    @Override
    protected void doHead(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        Route route = route(req,resp);
        if (route==null)
        {
            return;
        }
        File file = getRealPath(req,route.resource);
        if (file==null)
        {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected long getLastModified(HttpServletRequest req)
    {
        String filepath = null;
        try
        {
            Route route = route(req,null);
            if (route!=null)
            {
                filepath = route.resource;
            }
        }
        catch (Exception e)
        {
            return -1;
        }
        File file = filepath == null ? null : getRealPath(req,filepath);
        if (file==null)
        {
            return -1;
        }
        if (filepath!=null)
        {
            return file.lastModified();
        }
        return -1;
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException
    {
        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        super.service(req, resp);
    }

    private void doStatsFilter (HttpServletRequest request, Route route, HttpServletResponse response, long duration)
    {
        if (!this.statsFilters.isEmpty())
        {
            IMessageDataObject stats = MessageUtils.createMessageDataObject();
            
            stats.put("sessionid", request.getSession().getId());
            stats.put("new_session",request.getSession().isNew());
            stats.put("appname",route.appname);
            stats.put("release",route.version);
            stats.put("path",route.path);
            stats.put("duration", duration);
            
            for (IApplicationStatsFilter filter : statsFilters)
            {
                filter.filter(stats);
            }
        }
    }
}
