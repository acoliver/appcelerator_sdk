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

import javax.servlet.http.HttpServlet;

/**
 * DispatchServlet
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public abstract class DispatchServlet extends HttpServlet
{
    private String[] urlPattern;

    /**
     * gets the url patterns this servlet handles
     *
     * @return array of string based url patterns this servlet handles
     */
    public String[] getUrlPattern()
    {
        return this.urlPattern;
    }

    /**
     * sets the url patterns this servlet handles
     *
     * @param urlPattern array of string based url patterns this servlet handles
     */
    public void setUrlPattern(String[] urlPattern)
    {
        this.urlPattern = urlPattern;
    }
}
