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
package org.appcelerator.session;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.InjectBean;

/**
 * ExecutableSessionManager
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class ExecutableSessionManager
{
    private static final Logger LOG = Logger.getLogger(ExecutableSessionManager.class);

    @InjectBean
    private IExecutableSessionFactory executableSessionFactory = null;
    private ReadWriteLock sessionLock = new ReentrantReadWriteLock();
    private Map<String, IExecutableSession> sessions = new HashMap<String, IExecutableSession>();
    private Map<Executor, Set<IExecutableSession>> executors = new HashMap<Executor, Set<IExecutableSession>>();

    public boolean addSession(IExecutableSession session)
    {
        if (LOG.isDebugEnabled()) LOG.debug("attempting to add " + session);

        if (null == session)
        {
            LOG.warn("unable to add null session");
            return false;
        }

        String sessionId = session.getSessionId();
        if (null == sessionId)
        {
            LOG.warn("null session id, unable to add " + session);
            return false;
        }

        Executor executor = session.getExecutor();
        if (null == executor)
        {
            LOG.warn("null executor, unable to add " + session);
            return false;
        }

        Set<IExecutableSession> sessionsForExecutor;
        sessionLock.writeLock().lock();
        try
        {
            if (null != sessions.get(sessionId))
            {
                if (LOG.isDebugEnabled()) LOG.debug("existing session for " + sessionId + ", unable to add " + session);
                return false;
            }

            sessionsForExecutor = executors.get(executor);
            if (null != sessionsForExecutor)
            {
                if (sessionsForExecutor.contains(session))
                {
                    LOG.warn("existing executor, unable to add " + session);
                    return false;
                }
            }
            else
            {
                sessionsForExecutor = new HashSet<IExecutableSession>();
                executors.put(executor, sessionsForExecutor);
            }
            sessionsForExecutor.add(session);
            sessions.put(sessionId, session);
        }
        finally
        {
            sessionLock.writeLock().unlock();
        }

        if (LOG.isInfoEnabled()) LOG.info("added " + session);
        return true;
    }

    public boolean removeSession(String sessionId)
    {
        if (LOG.isDebugEnabled()) LOG.debug("attempting to remove session with id: " + sessionId);

        IExecutableSession session;
        Executor executor;
        Set<IExecutableSession> sessionsForExecutor;
        sessionLock.writeLock().lock();
        try
        {
            if (null == (session = sessions.get(sessionId)))
            {
                LOG.warn("unable to remove session, no session exists for id " + sessionId);
                return false;
            }

            if (null == (executor = session.getExecutor()))
            {
                LOG.warn("unable to remove session, no executor exists for " + session);
                return false;
            }

            sessionsForExecutor = executors.get(executor);
            if (null == sessionsForExecutor)
            {
                LOG.warn("unable to remove session, no sessions for executor from " + session);
                return false;
            }

            if (!sessionsForExecutor.contains(session))
            {
                LOG.warn("unable to remove session, not mapped to executor for " + session);
                return false;
            }

            sessionsForExecutor.remove(session);
            if (sessionsForExecutor.isEmpty())
            {
                executors.remove(executor);
            }

            sessions.remove(sessionId);
        }
        finally
        {
            sessionLock.writeLock().unlock();
        }

        if (LOG.isInfoEnabled()) LOG.info("removed " + session);
        return true;
    }

    public boolean removeSession(IExecutableSession session)
    {
        if (LOG.isDebugEnabled()) LOG.debug("attempted to remove " + session);

        if (null == session)
        {
            LOG.warn("unable to remove null session");
            return false;
        }
        
        String sessionId = session.getSessionId();
        if (null == sessionId)
        {
            LOG.warn("unable to remove, null session id for " + session);
            return false;
        }

        return removeSession(sessionId);
    }

    public IExecutableSession getOrCreateSession(String sessionId, ISessionExecutorFactory sessionExecutorFactory)
    {
        IExecutableSession session = getSession(sessionId);
        if (null == session)
        {
            session = executableSessionFactory.createSession(sessionId, sessionExecutorFactory.createSessionExecutor(sessionId));
            if (!addSession(session))
            {
                session = getSession(sessionId);
            }
        }

        return session;
    }

    public IExecutableSession getSession(String sessionId)
    {
        sessionLock.readLock().lock();
        try
        {
            return sessions.get(sessionId);
        }
        finally
        {
            sessionLock.readLock().unlock();
        }
    }

    public Set<IExecutableSession> getSessions(Executor executor)
    {
        sessionLock.readLock().lock();
        try
        {
            return new HashSet<IExecutableSession>(executors.get(executor));
        }
        finally
        {
            sessionLock.readLock().unlock();
        }
    }

    public Executor getSessionExecutor(String sessionId)
    {
        IExecutableSession session = null;

        sessionLock.readLock().lock();
        try
        {
            session = sessions.get(sessionId);
        }
        finally
        {
            sessionLock.readLock().unlock();
        }

        if (null != session)
        {
            return session.getExecutor();
        }

        return null;
    }


    /**
     * Returns a string representation of the object. In general, the
     * <code>toString</code> method returns a string that
     * "textually represents" this object. The result should
     * be a concise but informative representation that is easy for a
     * person to read.
     * It is recommended that all subclasses override this method.
     * <p/>
     * The <code>toString</code> method for class <code>Object</code>
     * returns a string consisting of the name of the class of which the
     * object is an instance, the at-sign character `<code>@</code>', and
     * the unsigned hexadecimal representation of the hash code of the
     * object. In other words, this method returns a string equal to the
     * value of:
     * <blockquote>
     * <pre>
     * getClass().getName() + '@' + Integer.toHexString(hashCode())
     * </pre></blockquote>
     *
     * @return a string representation of the object.
     */
    @Override
    public String toString()
    {
        StringBuilder stringBuilder = new StringBuilder(getClass().getSimpleName());
        stringBuilder.append(" [sessions=");
        stringBuilder.append(sessions.size());
        stringBuilder.append(']');

        return stringBuilder.toString();
    }
}
