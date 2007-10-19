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
import javax.servlet.http.HttpServletResponse;

import org.appcelerator.util.GUID;
import org.appcelerator.util.TimeUtil;
import org.appcelerator.util.Util;

/**
 * this is a simple cookie that will tag new requests without a tracking cookie to 
 * have a tracking cookie
 * 
 * @author jhaynie
 */
public class CookieTrackerFilter implements Filter
{
    private String cookieName = "AUID";
    private long duration = TimeUtil.ONE_YEAR * 5;
    
    public void destroy()
    {
    }

    public void doFilter(ServletRequest arg0, ServletResponse arg1,
            FilterChain arg2) throws IOException, ServletException
    {
        if (arg0 instanceof HttpServletRequest)
        {
            HttpServletRequest req = (HttpServletRequest)arg0;
            String cookieValue = Util.getCookieValue(req,cookieName);
            if (cookieValue==null)
            {
                HttpServletResponse resp=(HttpServletResponse)arg1;
                Util.addCookie(resp, cookieName, GUID.asGUID(), (int)duration);
            }
        }
        arg2.doFilter(arg0, arg1);
    }

    public void init(FilterConfig arg0) throws ServletException
    {
        String name = arg0.getInitParameter("cookieName");
        if (name!=null)
        {
            cookieName = name;
        }
        String time = arg0.getInitParameter("cookieDuration");
        if (time!=null)
        {
            duration = TimeUtil.getTime(time);
        }
    }
}
