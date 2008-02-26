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
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.apache.log4j.Logger;
import org.appcelerator.util.TimeUtil;

/**
 * ExpiresFilter is a simple filter that will set an Expires HTTP header for
 * each path its configured to handle
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class ExpiresFilter implements Filter
{
    private static final Logger LOG = Logger.getLogger(ExpiresFilter.class);

    private static final String REQUEST_FILTERED = "__ExpiresFilter__";

    private long expires = 0;

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
     */
    public void init(FilterConfig config) throws ServletException
    {
        String expiresStr = config.getInitParameter("expires");
        expires = TimeUtil.getTime(expiresStr);
        if (LOG.isDebugEnabled())
        {
            LOG.debug("created expires filter: " + config.getFilterName() + " with Expires value of: " + expires + " ms (" + expiresStr + ")");
        }
    }

    /**
     * Checks if the request was filtered before, so guarantees to be executed
     * once per request. You can override this methods to define a more specific
     * behaviour.
     *
     * @param request checks if the request was filtered before.
     * @return true if it is the first execution
     */
    protected boolean isFilteredBefore(ServletRequest request)
    {
        return request.getAttribute(REQUEST_FILTERED) != null;
    }

    class WrappedResponse extends HttpServletResponseWrapper
    {
        int status = HttpServletResponse.SC_OK;
        boolean expiresSet;
        boolean cacheControlSet;

        /**
         * constructs a new WrappedResponse from the HttpServletResponse
         *
         * @param arg0 http servlet response to wrap
         */
        public WrappedResponse(HttpServletResponse arg0)
        {
            super(arg0);
        }


        @Override
        public void addDateHeader(String name, long value)
        {
            if (name.equals("Expires"))
            {
                expiresSet = true;
            }
            else if (name.equals("Cache-Control"))
            {
                cacheControlSet = true;
            }
            super.addDateHeader(name, value);
        }

        @Override
        public void setDateHeader(String name, long value)
        {
            if (name.equals("Expires"))
            {
                expiresSet = true;
            }
            else if (name.equals("Cache-Control"))
            {
                cacheControlSet = true;
            }
            super.setDateHeader(name, value);
        }

        /**
         * We override this so we can catch the response status. Only
         * responses with a status of 200 (<code>SC_OK</code>) will
         * be cached.
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
         * @return http repsonse status
         */
        public int getStatus()
        {
            return status;
        }
    }

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
     *      javax.servlet.ServletResponse, javax.servlet.FilterChain)
     */
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException
    {
        // avoid reentrance
        if (isFilteredBefore(request))
        {
            chain.doFilter(request, response);
            return;
        }

        // set so we only do this once
        request.setAttribute(REQUEST_FILTERED, Boolean.TRUE);

        // wrap our response so we can capture status code and date header
        HttpServletResponse resp = (HttpServletResponse) response;
        WrappedResponse wrappedResponse = new WrappedResponse(resp);

        // call the filter
        chain.doFilter(request, wrappedResponse);

        // we only want to apply Expires to 200OK
        if (wrappedResponse.getStatus() == HttpServletResponse.SC_OK)
        {
            if (!wrappedResponse.expiresSet)
            {
                long value = System.currentTimeMillis() + expires;

                /*
                if (LOG.isDebugEnabled())
                {
                    HttpServletRequest req = (HttpServletRequest) request;
                    String path = req.getServletPath();
                    LOG.debug("Setting Expires to: "
                            + new Date(value) + " for "
                            + path);
                }*/
                resp.setDateHeader("Expires", value);
            }
            if (!wrappedResponse.cacheControlSet)
            {
                if (expires <= 0)
                {
                    // no cache
                    resp.setHeader("Cache-Control", "private,no-cache,no-store");
                    resp.setHeader("Pragma", "no-cache");
                }
                else
                {
                    // max age is in seconds
                    long seconds = expires / TimeUtil.ONE_SECOND;
                    resp.setHeader("Cache-Control", "max-age=" + seconds);
                }
            }
        }
    }

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.Filter#destroy()
     */
    public void destroy()
    {
    }
}
