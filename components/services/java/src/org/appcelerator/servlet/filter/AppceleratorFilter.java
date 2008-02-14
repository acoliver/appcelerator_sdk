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
 */package org.appcelerator.servlet.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.log4j.Logger;

/**
 * This is a composite filter that wraps in a nice little package all
 * the filters necessary by appcelerator so that only one filter needs to be
 * included in the web.xml file
 * 
 * @author Jeff Haynie
 */
public class AppceleratorFilter implements Filter
{
    private static final Logger LOG = Logger.getLogger(AppceleratorFilter.class);
    
    private Filter [] filters = new Filter[]
    {
            new CookieTrackerFilter(),
            new XHRFilter(),
            new GZIPFilter()
    };

    /* (non-Javadoc)
     * @see javax.servlet.Filter#destroy()
     */
    public void destroy()
    {
        for (Filter filter : filters)
        {
            filter.destroy();
        }
    }

    /* (non-Javadoc)
     * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
     */
    public void doFilter(ServletRequest arg0, ServletResponse arg1,
            FilterChain arg2) throws IOException, ServletException
    {
        InternalFilterChain chain = new InternalFilterChain(arg2);
        chain.doFilter(arg0,arg1);
    }

    /* (non-Javadoc)
     * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
     */
    public void init(FilterConfig config) throws ServletException
    {
        for (Filter filter : filters)
        {
            LOG.info("Loading filter: "+filter);
            filter.init(config);
        }
    }
    
    final class InternalFilterChain implements FilterChain
    {
        private int currentFilter = -1;
        private FilterChain lastFilter;
        
        InternalFilterChain (FilterChain chain)
        {
            lastFilter = chain;
        }
        
        public void doFilter(ServletRequest req, ServletResponse resp)
            throws IOException, ServletException
        {
            currentFilter++;
            
            if (currentFilter < filters.length)
            {
                filters[currentFilter].doFilter(req,resp,this);
            }
            else
            {
                lastFilter.doFilter(req,resp);
            }
        }
    }
}
