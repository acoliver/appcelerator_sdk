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

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.servlet.http.HttpSessionBindingEvent;
import javax.servlet.http.HttpSessionBindingListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.apache.log4j.Logger;

/**
 * SessionManager handles the management of http sessions.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class SessionManager implements HttpSessionListener, HttpSessionBindingListener
{
    private static final Logger LOG = Logger.getLogger(SessionManager.class);
    private static final SessionManager instance = new SessionManager();
    private final Set<HttpSessionListener> sessionListeners = new CopyOnWriteArraySet<HttpSessionListener>();
    private final Set<HttpSessionBindingListener> bindingListeners = new CopyOnWriteArraySet<HttpSessionBindingListener>();
    private final Set<String> currentSessions = Collections.synchronizedSet(new HashSet<String>(100, 200));

    /**
     * private constructor.
     *
     * @see SessionManager#getInstance()
     */
    private SessionManager()
    {
    }

    /**
     * get singleton instance of session manager
     *
     * @return session manager singleton
     */
    public static SessionManager getInstance()
    {
        return instance;
    }

    /**
     * returns true if the session id is currently active or not on this server instance (only)
     *
     * @param id session id
     * @return <code>true</code> if the session is active, <code>false</code> otherwise
     */
    public boolean isActiveSession(String id)
    {
        return currentSessions.contains(id);
    }

    /**
     * add a session listener
     *
     * @param listener http session listener
     */
    public void addSessionListener(HttpSessionListener listener)
    {
        this.sessionListeners.add(listener);
    }

    /**
     * remove a previously registered listener
     *
     * @param listener http session listener
     */
    public void removeSessionListener(HttpSessionListener listener)
    {
        this.sessionListeners.remove(listener);
    }

    /**
     * add a session binding listener
     *
     * @param listener http session binding listener
     */
    public void addSessionListener(HttpSessionBindingListener listener)
    {
        this.bindingListeners.add(listener);
    }

    /**
     * remove a previously registered listener
     *
     * @param listener http binding session listener
     */
    public void removeSessionListener(HttpSessionBindingListener listener)
    {
        this.bindingListeners.remove(listener);
    }

    /**
     * get active number of sessions
     *
     * @return active number of sessions
     */
    public int getActiveSessionCount()
    {
        return this.currentSessions.size();
    }

    /**
     * called when a session is created
     *
     * @see javax.servlet.http.HttpSessionListener#sessionCreated(javax.servlet.http.HttpSessionEvent)
     */
    public void sessionCreated(HttpSessionEvent event)
    {
        boolean created = currentSessions.add(event.getSession().getId());
        if (created)
        {
            if (LOG.isDebugEnabled())
            {
                LOG.debug("session created: " + event.getSession().getId() + ", total now at: " + currentSessions.size());
            }

            Set<HttpSessionListener> copy = new CopyOnWriteArraySet<HttpSessionListener>(sessionListeners);
            for (HttpSessionListener listener : copy)
            {
                listener.sessionCreated(event);
            }
        }
    }

    /**
     * Creates a session with the specified sessionID.  This is used for <b>TESTING PURPOSES ONLY!</b>  Listeners are
     * not called with this method.
     *
     * @param sessionID String based session identifier.
     */
    public void sessionCreated(String sessionID)
    {
        boolean created = currentSessions.add(sessionID);
        if (created)
        {
            if (LOG.isDebugEnabled())
            {
                LOG.debug("session created: " + sessionID + ", total now at: " + currentSessions.size());
            }
        }
    }

    /**
     * Destroys a session with the specified sessionID.  This is used for <b>TESTING PURPOSES ONLY!</b>  Listeners are
     * not called with this method.
     *
     * @param sessionID String based session identifier.
     */
    public void sessionDestroyed(String sessionID)
    {
        boolean removed = currentSessions.remove(sessionID);
        if (removed)
        {
            if (LOG.isDebugEnabled())
            {
                LOG.debug("session destroyed: " + sessionID + ", total now at: " + currentSessions.size());
            }
        }
    }

    /**
     * called when a session is destroyed
     *
     * @see javax.servlet.http.HttpSessionListener#sessionDestroyed(javax.servlet.http.HttpSessionEvent)
     */
    public void sessionDestroyed(HttpSessionEvent event)
    {
        boolean removed = currentSessions.remove(event.getSession().getId());
        if (removed)
        {
            if (LOG.isDebugEnabled())
            {
                LOG.debug("session destroyed: " + event.getSession().getId() + ", total now at: " + currentSessions.size());
            }

            Set<HttpSessionListener> copy = new CopyOnWriteArraySet<HttpSessionListener>(sessionListeners);
            for (HttpSessionListener listener : copy)
            {
                listener.sessionDestroyed(event);
            }
        }
    }

    /**
     * called when a value is bound to the session
     *
     * @param event http session binding event
     * @see javax.servlet.http.HttpSessionBindingListener#valueBound(javax.servlet.http.HttpSessionBindingEvent)
     */
    public void valueBound(HttpSessionBindingEvent event)
    {
        for (HttpSessionBindingListener listener : this.bindingListeners)
        {
            listener.valueBound(event);
        }
    }

    /**
     * called when a value is unbound
     *
     * @param event http session binding event
     * @see javax.servlet.http.HttpSessionBindingListener#valueUnbound(javax.servlet.http.HttpSessionBindingEvent)
     */
    public void valueUnbound(HttpSessionBindingEvent event)
    {
        for (HttpSessionBindingListener listener : this.bindingListeners)
        {
            listener.valueUnbound(event);
        }
    }
}
