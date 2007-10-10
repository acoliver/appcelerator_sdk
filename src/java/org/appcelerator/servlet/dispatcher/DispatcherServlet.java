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
package org.appcelerator.servlet.dispatcher;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;

import org.apache.log4j.Logger;
import org.appcelerator.Constants;
import org.appcelerator.servlet.filter.MonitoredHttpServletRequest;
import org.appcelerator.servlet.filter.MonitoredHttpServletResponse;
import org.appcelerator.servlet.filter.MonitoredHttpSession;
import org.appcelerator.servlet.listener.SessionManager;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.orm.hibernate3.SessionFactoryUtils;
import org.springframework.orm.hibernate3.SessionHolder;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.util.WebUtils;

/**
 * DispatcherServlet is a servlet that will dispatch servlets to servlets configured
 * in a Spring BeanFactory instead of web.xml. This allows you to take advantage of
 * AOP, dependency injection and many other valuable features of Spring.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class DispatcherServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;
    private static final Logger LOG = Logger.getLogger(DispatcherServlet.class);
    private final Set<Route> routes = new HashSet<Route>();
    private SessionFactory sessionFactory;

    /**
     * override of HttpServlet service method
     *
     * @param request  the {@link HttpServletRequest} object that contains the request the client made of the servlet
     * @param response the {@link HttpServletResponse} object that contains the response the servlet returns to the client
     * @throws ServletException if the HTTP request cannot be handled
     * @throws IOException      if an input or output error occurs while the servlet is handling the HTTP request
     */
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        response.setStatus(HttpServletResponse.SC_OK);
        
        String oldThreadName = Thread.currentThread().getName();
        // determine the URI, removing the dispatcher servlets path
        String uri = request.getRequestURI();
        String fullpath = request.getRequestURL().toString();
        String path = request.getServletPath();

        int idx = uri.indexOf(path);
        if (idx != -1)
        {
            String rootURLPath = fullpath.substring(0, fullpath.length() - uri.length()) + uri.substring(0, idx);

            request.setAttribute("rootURLPath", rootURLPath);
            request.setAttribute("urlPath", fullpath);

            uri = uri.substring(idx + path.length());
        }
        Thread.currentThread().setName(oldThreadName + "@" + uri);

        try
        {
            // attempt to find our dispatched servlet to route it to
            for (Route route : routes)
            {
                if (route.matches(uri))
                {
                    if (LOG.isDebugEnabled())
                    {
                        LOG.debug("URI: " + uri + " matched servlet: " + route.servlet);
                    }
                    // delegate to our target servlet
                    dispatch(route.servlet, request, response);
                    return;
                }
            }

            if (LOG.isDebugEnabled())
            {
                LOG.debug("URI: " + uri + " matched no servlets, returning 404, tried " + routes.size());
            }
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
        finally
        {
            Thread.currentThread().setName(oldThreadName);
        }
    }

    /**
     * handles dispatching the original service request to the appropriate target servlet
     *
     * @param servlet  target servlet
     * @param request  the {@link HttpServletRequest} object that contains the request the client made of the servlet
     * @param response the {@link HttpServletResponse} object that contains the response the servlet returns to the client
     * @throws ServletException if the HTTP request cannot be handled
     * @throws IOException      if an input or output error occurs while the servlet is handling the HTTP request
     */
    private void dispatch(HttpServlet servlet, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        // we *must* be the first in the filter chain which means this should return null
        // on a new session since we specify false (don't create)
        HttpSession _session = request.getSession(false);
        if (_session == null)
        {
            // ok, this is good, we need to create it explicitly now
            _session = request.getSession(true);
            _session.setMaxInactiveInterval(Constants.SESSION_TIMEOUT__IN_SECONDS);

            if (LOG.isDebugEnabled())
            {
                StringBuilder cookiesStr = new StringBuilder();
                if (request.getCookies() != null)
                {
                    for (Cookie cookie : request.getCookies())
                    {
                        cookiesStr.append(cookie.getName());
                        cookiesStr.append("=");
                        cookiesStr.append(cookie.getValue());
                        cookiesStr.append(";");
                    }
                    LOG.debug("new session, cookies: " + cookiesStr);
                }
            }
        }

        String currentThreadName = Thread.currentThread().getName();
        Thread.currentThread().setName(_session.getId());

        MonitoredHttpSession session = new MonitoredHttpSession(_session);

        if (!_session.isNew())
        {
            // if not new, we should have it in our session and if we don't that means that
            // its a restarted session
            if (!SessionManager.getInstance().isActiveSession(_session.getId()))
            {
                if (LOG.isDebugEnabled())
                {
                    LOG.debug("session restored between restarts (most likely), re-fire session created event for " + session.getId());
                }
                _session.setAttribute(Constants.SESSION_RESTORED, Boolean.TRUE);
                //ok, webserver restarted since we created this 
                HttpSessionEvent event = new HttpSessionEvent(session);
                SessionManager.getInstance().sessionCreated(event);
            }
        }

        Object mutex = _session.getAttribute(WebUtils.SESSION_MUTEX_ATTRIBUTE);
        if (mutex == null)
        {
            mutex = new Object();
            _session.setAttribute(WebUtils.SESSION_MUTEX_ATTRIBUTE, mutex);
        }

        // wrap the request / response

        MonitoredHttpServletRequest req = new MonitoredHttpServletRequest(request, session);
        MonitoredHttpServletResponse resp = new MonitoredHttpServletResponse(response);
        try
        {
            servlet.service(req, resp);
        }
        finally
        {
            try
            {
                boolean destroyed = !session.isValid();

                if (!destroyed)
                {
                    try
                    {
                        _session.removeAttribute(Constants.SESSION_RESTORED);
                        _session.removeAttribute(Constants.SESSION_USER_CHANGE);
                    }
                    catch (IllegalStateException ex)
                    {
                        // this can still happen if the underlying container invalidates,
                        // in this case, just let it happen
                        destroyed = true;
                    }
                }
                if (!destroyed)
                {
                    try
                    {
                        if (_session.getAttribute(Constants.SESSION_EXPIRED) != null)
                        {
                            if (LOG.isDebugEnabled())
                            {
                                LOG.debug("invalidating expired session: " + req.getSession().getId());
                            }
                            _session.removeAttribute(Constants.SESSION_EXPIRED);
                            _session.invalidate();
                        }
                    }
                    catch (IllegalStateException ig)
                    {
                        // this is OK, just means we're already expired
                    }
                }
                if (destroyed)
                {
                    // we have to do this because of a race condition on container where new request
                    // pending will re-create same session even though outgoing is invalidated
                    SessionManager.getInstance().sessionDestroyed(new HttpSessionEvent(session));
                }

                // since we can have multiple session threads coming through here, we need to make sure
                // and synchronize all of them against the session mutex
                if (sessionFactory!=null)
                {
                    synchronized (mutex)
                    {
                        if (TransactionSynchronizationManager.hasResource(sessionFactory))
                        {
                            SessionHolder sessionHolder = (SessionHolder) TransactionSynchronizationManager.unbindResource(sessionFactory);
                            if (sessionHolder != null)
                            {
                                SessionFactoryUtils.closeSession(sessionHolder.getSession());
                            }
                        }
                    }
                }
            }
            finally
            {
                if (currentThreadName != null)
                {
                    Thread.currentThread().setName(currentThreadName);
                }
            }
        }
    }

    /**
     * Called by the servlet container to indicate to a servlet that the
     * servlet is being taken out of service.  See Servlet#destroy.
     */
    @Override
    public void destroy()
    {
        for (Route route : routes)
        {
            if (LOG.isDebugEnabled())
            {
                LOG.debug("calling destroy for servlet: " + route.servlet);
            }
            route.servlet.destroy();
        }
        routes.clear();
        super.destroy();
    }

    /**
     * Route encapsulates pattern(s) and dispatch servlet to faciliate matching when the request url satisfies a pattern.
     */
    private final class Route
    {
        private final Pattern[] patterns;
        private final DispatchServlet servlet;

        /**
         * constructs a new route for the specified servlet
         *
         * @param servlet dispatch servlet to route to
         */
        Route(DispatchServlet servlet)
        {
            this.servlet = servlet;
            String[] urlPatternStrings = servlet.getUrlPattern();
            patterns = new Pattern[urlPatternStrings.length];
            int index = 0;
            for (String urlPatternString : urlPatternStrings)
            {
                patterns[index++] = Pattern.compile(urlPatternString);
            }
        }

        /**
         * called to determine if the url matches any of the pattern(s) for this dispatch servlet
         *
         * @param url url to attempt matching
         * @return <code>true</code> if matched, <code>false</code> otherwise
         */
        boolean matches(String url)
        {
            for (Pattern pattern : patterns)
            {
                if (pattern.matcher(url).matches())
                {
                    return true;
                }
            }

            return false;
        }
    }

    /**
     * Called by the servlet container to indicate to a servlet that the
     * servlet is being placed into service.
     * <p/>
     * <p>This implementation sets up the configured beans of DispatchServlet type
     * and creates Routes for them to service appropriate requests.  When overriding this form
     * of the method, call <code>super.init(config)</code>.
     *
     * @param config the <code>ServletConfig</code> object that contains configutation information for this servlet
     * @throws ServletException if an exception occurs that interrupts the servlet's normal operation
     */
    @SuppressWarnings("unchecked")
    @Override
    public void init(ServletConfig config) throws ServletException
    {
        super.init(config);
        ListableBeanFactory factory = (ListableBeanFactory) config.getServletContext().getAttribute(Constants.BEAN_FACTORY);
        if (factory.containsBean("sessionFactory"))
        {
            sessionFactory = (SessionFactory) factory.getBean("sessionFactory", SessionFactory.class);
        }
        Map<String, DispatchServlet> servlets = factory.getBeansOfType(DispatchServlet.class);
        for (String name : servlets.keySet())
        {
            DispatchServlet servlet = servlets.get(name);
            if (LOG.isDebugEnabled())
            {
                LOG.debug("calling init for servlet: " + name + ", " + servlet);
            }
            try
            {
                servlet.init(getServletConfig());
                this.routes.add(new Route(servlet));
            }
            catch (Exception ex)
            {
                LOG.error("Error loading servlet: " + servlet, ex);
            }
        }
    }
}
