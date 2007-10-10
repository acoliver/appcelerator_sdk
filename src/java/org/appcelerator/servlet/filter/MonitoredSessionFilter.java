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
package org.appcelerator.servlet.filter;

import java.io.IOException;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;

import org.apache.log4j.Logger;
import org.appcelerator.Constants;
import org.appcelerator.servlet.listener.SessionManager;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.orm.hibernate3.SessionFactoryUtils;
import org.springframework.orm.hibernate3.SessionHolder;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.util.WebUtils;

/**
 * MonitoredSessionFilter handles session management via the SessionManager and wraps sessions and requests with
 * monitored objects.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 * @see org.appcelerator.servlet.filter.MonitoredHttpServletRequest
 * @see org.appcelerator.servlet.filter.MonitoredHttpServletResponse
 * @see org.appcelerator.servlet.filter.MonitoredHttpSession
 */
public class MonitoredSessionFilter implements Filter
{
    private static final Logger LOG = Logger.getLogger(MonitoredSessionFilter.class);
    private static final String FILTER_FLAG = MonitoredSessionFilter.class.getName() + "." + System.currentTimeMillis();
    private Pattern excludeRegex;
    private SessionFactory sessionFactory;

    /* (non-Javadoc)
    * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
    */
    public void init(FilterConfig arg0) throws ServletException
    {
        String regex = arg0.getInitParameter("excludeRegex");
        if (regex != null)
        {
            excludeRegex = Pattern.compile(regex, Pattern.DOTALL);
        }
        ListableBeanFactory factory = (ListableBeanFactory) arg0.getServletContext().getAttribute(Constants.BEAN_FACTORY);
        sessionFactory = (SessionFactory) factory.getBean("sessionFactory", SessionFactory.class);
    }

    /* (non-Javadoc)
     * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
     */
    public void doFilter(ServletRequest arg0, ServletResponse arg1, FilterChain arg2) throws IOException, ServletException
    {
        HttpServletRequest req = (HttpServletRequest) arg0;
        Object obj = req.getAttribute(FILTER_FLAG);
        if (obj != null)
        {
            arg2.doFilter(arg0, arg1);
        }
        else
        {
            req.setAttribute(FILTER_FLAG, Boolean.TRUE);

            // determine if we should exclude this or not
            String path = req.getServletPath();
            if (null != excludeRegex && excludeRegex.matcher(path).matches())
            {
                arg2.doFilter(req, arg1);
                return;
            }

            // we *must* be the first in the filter chain which means this should return null
            // on a new session since we specify false (don't create)
            HttpSession _session = req.getSession(false);
            if (_session == null)
            {
                // ok, this is good, we need to create it explicitly now
                _session = req.getSession(true);
                _session.setMaxInactiveInterval(Constants.SESSION_TIMEOUT__IN_SECONDS);

                if (LOG.isDebugEnabled())
                {
                    StringBuilder cookiesStr = new StringBuilder();
                    if (req.getCookies() != null)
                    {
                        for (Cookie cookie : req.getCookies())
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
                boolean exists = SessionManager.getInstance().isActiveSession(_session.getId());
                if (!exists)
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
                _session.setAttribute(WebUtils.SESSION_MUTEX_ATTRIBUTE, new Object());
            }

            MonitoredHttpServletRequest request = new MonitoredHttpServletRequest(req, session);
            MonitoredHttpServletResponse response = new MonitoredHttpServletResponse((HttpServletResponse) arg1);

            try
            {
                // invoke filter chain
                arg2.doFilter(request, response);
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
                    synchronized (mutex)
                    {
                        if (TransactionSynchronizationManager.hasResource(sessionFactory))
                        {
                            SessionHolder sessionHolder = (SessionHolder) TransactionSynchronizationManager.unbindResource(sessionFactory);
                            if (sessionHolder != null)
                            {
                                SessionFactoryUtils.closeSession(sessionHolder.getSession());
//                                sessionHolder.clear();
//                                LOG.debug("forced clear of session, map="+TransactionSynchronizationManager.getResourceMap());
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
    }

    /* (non-Javadoc)
     * @see javax.servlet.Filter#destroy()
     */
    public void destroy()
    {
    }

}
