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

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.web.util.WebUtils;

/**
 * SessionSynchronizationFilter is responsible for atomic management of sessions.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class SessionSynchronizationFilter implements Filter
{
    private static final Logger log = Logger.getLogger(SessionSynchronizationFilter.class);
    private static final String FILTER_FLAG = SessionSynchronizationFilter.class.getName() + "." + System.currentTimeMillis();

    /* (non-Javadoc)
     * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
     */
    public void init(FilterConfig arg0) throws ServletException
    {
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
            Object mutex = ((HttpServletRequest) arg0).getSession().getAttribute(WebUtils.SESSION_MUTEX_ATTRIBUTE);
            synchronized (mutex)
            {
                if (log.isDebugEnabled()) log.debug("beginning atomic session for " + req.getSession().getId());
                try
                {
                    arg2.doFilter(arg0, arg1);
                }
                finally
                {
                    if (log.isDebugEnabled()) log.debug("finishing atomic session for " + req.getSession().getId());
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
