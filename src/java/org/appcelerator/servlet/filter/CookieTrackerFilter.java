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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
    private boolean trackSubdomains = true;
    private static final Pattern IPADDRESS = Pattern.compile("[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}");
    private static final Pattern DOMAIN = Pattern.compile("(.*?)(\\.[\\w]+\\.[\\w]+)$");

    public void destroy()
    {
    }
    
    public String getDomain (String servername)
    {
        if (servername!=null)
        {
            if (!IPADDRESS.matcher(servername).matches())
            {
                Matcher matcher = DOMAIN.matcher(servername);
                if (matcher.find())
                {
                    return matcher.group(2);
                }
            }
        }
        return null;
    }
    
    public void doFilter(ServletRequest arg0, ServletResponse arg1,
            FilterChain arg2) throws IOException, ServletException
    {
        if (arg0 instanceof HttpServletRequest)
        {
            HttpServletRequest req = (HttpServletRequest)arg0;
            String auid = Util.getCookieValue(req,cookieName);
            if (auid==null)
            {
                String domain = trackSubdomains ? getDomain(req.getServerName()) : null;
                HttpServletResponse resp=(HttpServletResponse)arg1;
                auid = req.getParameter("auid");
                if (auid == null || "".equals(auid))
                {
                    auid = GUID.asGUID();
                }                
                Util.addCookie(resp, cookieName, auid, domain, (int)duration);
            }
            HttpSession httpSession = req.getSession();
            if (httpSession.getAttribute("AUID")==null)
            {
                httpSession.setAttribute("AUID", auid);
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
        String subdomain = arg0.getInitParameter("trackSubdomains");
        if (subdomain!=null)
        {
            trackSubdomains = Boolean.valueOf(subdomain);
        }
    }
}
