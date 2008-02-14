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
package org.appcelerator.servlet.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.appcelerator.spring.ContextLoaderPreProcessor;
import org.appcelerator.spring.LogConfigPreProcessor;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.util.HttpSessionMutexListener;
import org.springframework.web.util.Log4jConfigListener;

/**
 * This is a composite listener that wraps in a nice little package all
 * the listeners necessary by appcelerator so that only one needs to be
 * included in the web.xml file
 * 
 * @author Jeff Haynie
 */
public class AppceleratorListener implements HttpSessionListener,
        HttpSessionBindingListener, ServletContextListener
{
    private final HttpSessionListener listeners [] = new HttpSessionListener[]
    {                         
         new SessionListener(),
         new HttpSessionMutexListener()
    };
    private final HttpSessionBindingListener bindings [] = new HttpSessionBindingListener[]
    {                                                                       
         new SessionListener()   
    };
    private final ServletContextListener contexts [] = new ServletContextListener[]
    {
         new LogConfigPreProcessor(),
         new Log4jConfigListener(),
         new ContextLoaderPreProcessor(),
         new ContextLoaderListener()
    };

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSessionListener#sessionCreated(javax.servlet.http.HttpSessionEvent)
     */
    public void sessionCreated(HttpSessionEvent arg0)
    {
        for (HttpSessionListener listener : listeners)
        {
            listener.sessionCreated(arg0);
        }
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSessionListener#sessionDestroyed(javax.servlet.http.HttpSessionEvent)
     */
    public void sessionDestroyed(HttpSessionEvent arg0)
    {
        for (HttpSessionListener listener : listeners)
        {
            listener.sessionCreated(arg0);
        }
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSessionBindingListener#valueBound(javax.servlet.http.HttpSessionBindingEvent)
     */
    public void valueBound(HttpSessionBindingEvent arg0)
    {
        for (HttpSessionBindingListener listener : bindings)
        {
            listener.valueBound(arg0);
        }
    }

    /* (non-Javadoc)
     * @see javax.servlet.http.HttpSessionBindingListener#valueUnbound(javax.servlet.http.HttpSessionBindingEvent)
     */
    public void valueUnbound(HttpSessionBindingEvent arg0)
    {
        for (HttpSessionBindingListener listener : bindings)
        {
            listener.valueUnbound(arg0);
        }
    }

    public void contextDestroyed(ServletContextEvent arg0)
    {
        for (ServletContextListener l : contexts)
        {
            l.contextDestroyed(arg0);
        }
    }

    public void contextInitialized(ServletContextEvent arg0)
    {
        for (ServletContextListener l : contexts)
        {
            l.contextInitialized(arg0);
        }
    }

}
