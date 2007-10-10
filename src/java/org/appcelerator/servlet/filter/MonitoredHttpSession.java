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

import java.io.Serializable;
import java.util.Enumeration;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionContext;

import org.appcelerator.servlet.listener.SessionManager;

/**
 * MonitoredHttpSession
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class MonitoredHttpSession implements HttpSession, Serializable
{
    private static final long serialVersionUID = 1L;
    private HttpSession sessionDelegate;
    private boolean valid = true;

    /**
     * constructs a new MonitoredHttpSession from the HttpSession
     *
     * @param session http session
     */
    public MonitoredHttpSession(HttpSession session)
    {
        this.sessionDelegate = session;
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getCreationTime()
     */
    public long getCreationTime()
    {
        return sessionDelegate.getCreationTime();
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getId()
     */
    public String getId()
    {
        return sessionDelegate.getId();
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getLastAccessedTime()
     */
    public long getLastAccessedTime()
    {
        return sessionDelegate.getLastAccessedTime();
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getServletContext()
     */
    public ServletContext getServletContext()
    {
        return sessionDelegate.getServletContext();
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#setMaxInactiveInterval(int)
     */
    public void setMaxInactiveInterval(int arg0)
    {
        this.sessionDelegate.setMaxInactiveInterval(arg0);
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getMaxInactiveInterval()
     */
    public int getMaxInactiveInterval()
    {
        return sessionDelegate.getMaxInactiveInterval();
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getSessionContext()
     */
    @SuppressWarnings("deprecation")
    public HttpSessionContext getSessionContext()
    {
        return sessionDelegate.getSessionContext();
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getAttribute(java.lang.String)
     */
    public Object getAttribute(String arg0)
    {
        return sessionDelegate.getAttribute(arg0);
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getValue(java.lang.String)
     */
    @SuppressWarnings("deprecation")
    public Object getValue(String arg0)
    {
        return sessionDelegate.getValue(arg0);
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getAttributeNames()
     */
    public Enumeration getAttributeNames()
    {
        return sessionDelegate.getAttributeNames();
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#getValueNames()
     */
    @SuppressWarnings("deprecation")
    public String[] getValueNames()
    {
        return sessionDelegate.getValueNames();
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#setAttribute(java.lang.String, java.lang.Object)
     */
    public void setAttribute(String arg0, Object arg1)
    {
        Object value = sessionDelegate.getAttribute(arg0);
        if (value != null)
        {
            SessionManager.getInstance().valueUnbound(new HttpSessionBindingEvent(this, arg0, value));
        }
        this.sessionDelegate.setAttribute(arg0, arg1);
        SessionManager.getInstance().valueBound(new HttpSessionBindingEvent(this, arg0, arg1));
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#putValue(java.lang.String, java.lang.Object)
     */
    public void putValue(String arg0, Object arg1)
    {
        Object value = sessionDelegate.getAttribute(arg0);
        if (value != null)
        {
            SessionManager.getInstance().valueUnbound(new HttpSessionBindingEvent(this, arg0, value));
        }
        this.sessionDelegate.setAttribute(arg0, arg1);
        SessionManager.getInstance().valueBound(new HttpSessionBindingEvent(this, arg0, arg1));
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#removeAttribute(java.lang.String)
     */
    public void removeAttribute(String arg0)
    {
        Object value = sessionDelegate.getAttribute(arg0);
        sessionDelegate.removeAttribute(arg0);
        if (value != null)
        {
            SessionManager.getInstance().valueUnbound(new HttpSessionBindingEvent(this, arg0, value));
        }
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#removeValue(java.lang.String)
     */
    public void removeValue(String arg0)
    {
        Object value = sessionDelegate.getAttribute(arg0);
        sessionDelegate.removeAttribute(arg0);
        if (value != null)
        {
            SessionManager.getInstance().valueUnbound(new HttpSessionBindingEvent(this, arg0, value));
        }
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#invalidate()
     */
    public void invalidate()
    {
        valid = false;
        sessionDelegate.invalidate();
    }

    /**
     * returns true if the session is valid (has not been invalidated)
     *
     * @return <code>true</code> if the session is still valid, <code>false</code> otherwise
     */
    public boolean isValid()
    {
        return this.valid;
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSession#isNew()
     */
    public boolean isNew()
    {
        return sessionDelegate.isNew();
    }

}
