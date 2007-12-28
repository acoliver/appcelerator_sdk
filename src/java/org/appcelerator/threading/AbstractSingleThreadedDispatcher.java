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
package org.appcelerator.threading;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.log4j.Logger;

/**
 * AbstractSingleThreadedDispatcher is a base class that handles single threaded dipatching of events/tasks.
 */
public abstract class AbstractSingleThreadedDispatcher
{
    private static final Logger LOG = Logger.getLogger(AbstractSingleThreadedDispatcher.class);
    private static final int DEFAULT_MAX_EVENTS = Integer.parseInt(System.getProperty("app.thread.maxevents", "30"));

    protected Executor threadPool;
    private final ConcurrentLinkedQueue<Object> events = new ConcurrentLinkedQueue<Object>();
    private Object source;
    private int maxNumberOfEventsToHandle = DEFAULT_MAX_EVENTS;
    private final AtomicBoolean handling = new AtomicBoolean(false);
    private volatile boolean destroyed = false;
    private final Handler handler = new Handler();

    protected AbstractSingleThreadedDispatcher(Object source, Executor threadPool)
    {
        this.source = source;
        this.threadPool = threadPool;
    }

    /**
     * get the maximum number of events to handle
     *
     * @return number of events
     */
    public int getMaxNumberOfEventsToHandle()
    {
        return maxNumberOfEventsToHandle;
    }

    /**
     * set the maximum number of events to handle
     *
     * @param maxNumberOfEventsToHandle max events
     */
    public void setMaxNumberOfEventsToHandle(int maxNumberOfEventsToHandle)
    {
        this.maxNumberOfEventsToHandle = maxNumberOfEventsToHandle;
    }

    /**
     * get the source (owner) of the dispatcher
     *
     * @return source
     */
    public Object getSource()
    {
        return source;
    }

    /**
     * called to empty the queue of events and stop running
     *
     * @return number of objects emptied
     */
    protected int emptyQueue()
    {
        // don't sync here, worse case we empty it twice
        int count = 0;
        try
        {
            // drain the queue
            while (events.peek() != null)
            {
                Object n = events.poll();
                if (n != null) count++;
            }
        }
        catch (Exception ex)
        {
            LOG.warn("problem emptying queue", ex);
        }
        return count;
    }

    /**
     * gets the task/event queue
     *
     * @return queue
     */
    protected Queue<Object> getQueue()
    {
        return events;
    }

    /**
     * empties the queue while finishing the remaining tasks
     */
    public void finishQueue()
    {
        try
        {
            while (events.peek() != null)
            {
                Object n = events.poll();
                if (n != null)
                {
                    handle(n);
                }
            }
        }
        catch (Exception ex)
        {
            LOG.warn("error finishing queue", ex);
        }
    }

    /**
     * determines whether the dispatcher is currently running
     *
     * @return <code>true</code> if running, <code>false</code> otherwise
     */
    public boolean isRunning()
    {
        return handling.get();
    }

    /**
     * determines whether the dispatcher is destroyed
     *
     * @return <code>true</code> if destroyed, <code>false</code> otherwise
     */
    public boolean isDestroyed()
    {
        return destroyed;
    }

    /**
     * destroys the dispatcher
     */
    public void destroy()
    {
        this.destroyed = true;
        this.events.clear();
    }

    /**
     * handler for events which will run
     * <p/>
     * <ul>
     * <li>dispatcher is running</li>
     * <li>dispatcher is not destroyed</li>
     * <li>there are more event objects to be handled</li>
     * <p/>
     * when none of these are satisfied, the task will end.
     */
    private final class Handler implements Runnable
    {
        public String toString()
        {
            return source + " Event Dispatcher Handler";
        }

        public void run()
        {
            String oldname = Thread.currentThread().getName();
            Thread.currentThread().setName(source.toString());
            try
            {
                // as long as we're running and there are events in the queue
                // dispatch...
                int count = 0;
                while (!isDestroyed() && count < maxNumberOfEventsToHandle)
                {
                    try
                    {
                        Object n = events.poll();
                        if (n == null)
                        {
                            // no more events
                            break;
                        }
                        handle(n);
                        count++;
                    }
                    catch (Throwable ex)
                    {
                        LOG.error("Unhandled Error caught in dispatcher for: " + source, ex);
                    }
                }
            }
            finally
            {
                // make sure we reset the handling once we're done
                handling.set(false);

                // set old name
                Thread.currentThread().setName(oldname);

                if (!events.isEmpty())
                {
                    if (handling.compareAndSet(false, true))
                    {
                        threadPool.execute(handler);
                    }
                }
            }
        }
    }

    /**
     * send the event/task causing it to be executed on the dispatcher
     *
     * @param obj object to send
     * @return <code>true</code> if sent, <code>false</code> otherwise
     */
    public boolean send(Object obj)
    {
        if (destroyed)
        {
            LOG.warn("Couldn't add event: " + obj + " to " + this + ", we're already destroyed");
            return false;
        }

        events.add(obj);

        //
        // fast check to see if we need to start a handler
        // expect that we're not running and we need to 
        // start a handler, returns true if that's the case,
        // false if we're already running a handler in which
        // case we just let it keep running
        //
        if (handling.compareAndSet(false, true))
        {
            threadPool.execute(handler);
        }

        return true;
    }

    /**
     * subclasses must implement the handle logic to do what ever needs to be done
     * when the object is ready to be handled in a single threaded dispatcher thread.   <P>
     * <p/>
     * this method should not be synchronized by the subclass since it is executed
     * inside (ordered) in the dispatcher handler thread.
     *
     * @param obj object to handle
     */
    protected abstract void handle(Object obj);

    /**
     * gets the thread pool for this dispatcher
     *
     * @return thread pool
     */
    public Executor getThreadPool()
    {
        return threadPool;
    }

    /**
     * set the thread pool for this dispatcher
     *
     * @param threadPool thread pool
     */
    public void setThreadPool(Executor threadPool)
    {
        this.threadPool = threadPool;
    }

    /**
     * set the source for this dispatcher
     *
     * @param source source
     */
    public void setSource(Object source)
    {
        this.source = source;
    }
}
