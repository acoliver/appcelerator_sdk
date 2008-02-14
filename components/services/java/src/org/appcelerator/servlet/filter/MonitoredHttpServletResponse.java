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

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.apache.log4j.Logger;

/**
 * MonitoredHttpServletResponse tracks a http servlet response.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class MonitoredHttpServletResponse extends HttpServletResponseWrapper
{
    private static final Logger LOG = Logger.getLogger(MonitoredHttpServletResponse.class);
    private int status = HttpServletResponse.SC_OK;

    /**
     * Constructs a new MonitoredHttpServletResponse.
     *
     * @param arg0 http servlet response
     */
    public MonitoredHttpServletResponse(HttpServletResponse arg0)
    {
        super(arg0);
    }

    @Override
    public void addCookie(Cookie arg0)
    {
        if (arg0.getPath() == null)
        {
            arg0.setPath("/");
        }
        if (arg0.getValue() == null)
        {
            arg0.setMaxAge(0);
        }
        if (LOG.isDebugEnabled())
        {
            LOG.debug("Adding response Cookie:" + arg0.getName() + "=" + arg0.getValue() + ",age=" + arg0.getMaxAge() + ",path=" + arg0.getPath());
        }
        super.addCookie(arg0);
    }

    /**
     * We override this so we can catch the response status. Only
     * responses with a status of 200 (<code>SC_OK</code>) will
     * be cached.
     *
     * @param status status to set
     */
    @Override
    public void setStatus(int status)
    {
        super.setStatus(status);
        this.status = status;
    }

    /**
     * We override this so we can catch the response status. Only
     * responses with a status of 200 (<code>SC_OK</code>) will
     * be cached.
     *
     * @param status status to set
     * @param string corresponding status string
     */
    @Override
    public void sendError(int status, String string) throws IOException
    {
        super.sendError(status, string);
        this.status = status;
    }

    /**
     * We override this so we can catch the response status. Only
     * responses with a status of 200 (<code>SC_OK</code>) will
     * be cached.
     *
     * @param status status to set
     */
    @Override
    public void sendError(int status) throws IOException
    {
        super.sendError(status);
        this.status = status;
    }

    /**
     * We override this so we can catch the response status. Only
     * responses with a status of 200 (<code>SC_OK</code>) will
     * be cached.
     *
     * @param status status to set
     * @param string corresponding status string
     */
    @Override
    public void setStatus(int status, String string)
    {
        super.setStatus(status, string);
        this.status = status;
    }

    /**
     * We override this so we can catch the response status. Only
     * responses with a status of 200 (<code>SC_OK</code>) will
     * be cached.
     *
     * @param location location to redirect to
     */
    @Override
    public void sendRedirect(String location) throws IOException
    {
        this.status = SC_MOVED_TEMPORARILY;
        super.sendRedirect(location);
    }

    /**
     * Retrieves the captured HttpResponse status.
     *
     * @return status
     */
    public int getStatus()
    {
        return status;
    }

}