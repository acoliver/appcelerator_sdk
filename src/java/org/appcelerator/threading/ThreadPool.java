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

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.prefs.Preferences;

import org.apache.log4j.Logger;

import EDU.oswego.cs.dl.util.concurrent.ThreadFactory;

/**
 * ThreadPool is a specialized pool implementation of BetterPooledExecutor.
 */
public class ThreadPool extends BetterPooledExecutor
{
    protected final Logger log = Logger.getLogger(getClass().getName());

    public static final String PREFKEY_THREADGROUP = "threadGroup";
    public static final String PREFKEY_BLOCKEDEXECUTIONHANDLER = "blockedExecutionHandler";
    public static final String PREFKEY_INITIALTHREADS = "createThreads";
    public static final String PREFKEY_KEEPALIVETIME = "keepAliveTime";
    public static final String PREFKEY_MINIMUMPOOLSIZE = "minimumPoolSize";
    public static final String PREFKEY_MAXIMUMPOOLSIZE = "maximumPoolSize";
    public static final String PREFKEY_NAME = "name";

    public static final int IDLE_THREAD_TIMEOUT = 360000;

    //  probably OS dependent? -- let it be overriden with system property
    public static final int MAXIMUM_SIZE = Integer.valueOf(System.getProperty("app.threading.maxthreads", "1000"));

    public static final int DEFFAULT_INITIAL_THREADS = 0;
    public static final int DEFAULT_KEEPALIVE = 60000; // one minute
    public static final int DEFAULT_MAXIMUM_SIZE = MAXIMUM_SIZE;
    public static final int DEFAULT_SIZE = 5;
    public static final String DEFAULT_POOL_NAME = "ThreadPool";

    private final String name;

    /**
     * default thread pool constructor
     */
    ThreadPool()
    {
        this(new LinkedBlockingQueue<Runnable>(), null, DEFAULT_SIZE, DEFAULT_MAXIMUM_SIZE);
    }

    /**
     * thread pool constructor
     *
     * @param name    thread pool name
     * @param size    default size
     * @param maxSize max size
     */
    ThreadPool(String name, int size, int maxSize)
    {
        this(new LinkedBlockingQueue<Runnable>(), name, size, maxSize);
    }

    /**
     * thread pool constructor
     *
     * @param size    default size
     * @param maxSize max size
     */
    ThreadPool(int size, int maxSize)
    {
        this(new LinkedBlockingQueue<Runnable>(), null, size, maxSize);
    }

    /**
     * ThreadPool created from preferences.
     * <p/>
     * See Doug Lea's PooledExecutor for the definitions of these value.
     * The following are preference keys that the pool
     * looks for:<p>
     * <li>name - Defaults to 'ThreadPool'</li>
     * <li>threadGroup - Defaults to name of pool</li>
     * <li>blockedExecutionHandler - Defaults to RunAndLogWhenBlocked</li>
     * <li>createThreads - Defaults to 0</li>
     * <li>keepAliveTime - Defaults to 360000</li>
     * <li>minimumPoolSize - Defaults to 1</li>
     * <li>maximumPoolSize - Defaults to 1000 (or value of app.threading.maxthreads system property)</li>
     *
     * @param channel blocking queue
     * @param prefs   preferences
     */
    ThreadPool(BlockingQueue<Runnable> channel, Preferences prefs)
    {
        super(channel);
        name = prefs.get(PREFKEY_NAME, DEFAULT_POOL_NAME);

        int maxSize = prefs.getInt(PREFKEY_MAXIMUMPOOLSIZE, DEFAULT_MAXIMUM_SIZE);
        setMaximumPoolSize(maxSize);

        int minSize = prefs.getInt(PREFKEY_MINIMUMPOOLSIZE, DEFAULT_MINIMUMPOOLSIZE);
        setMinimumPoolSize(minSize);

        long keepAlive = prefs.getLong(PREFKEY_KEEPALIVETIME, DEFAULT_KEEPALIVE);
        setKeepAliveTime(keepAlive);

        int initialThreads = prefs.getInt(PREFKEY_INITIALTHREADS, DEFFAULT_INITIAL_THREADS);
        createThreads(initialThreads);

        String exeHandlerClassName = prefs.get(PREFKEY_BLOCKEDEXECUTIONHANDLER, null);
        if (exeHandlerClassName != null)
        {
            try
            {
                Class handlerClass = Class.forName(exeHandlerClassName);
                BlockedExecutionHandler handler = (BlockedExecutionHandler) handlerClass.newInstance();
                setBlockedExecutionHandler(handler);
            }
            catch (Exception e)
            {
                LOG.debug("Setting execution handler to default because " + e.getMessage(), e);
                setBlockedExecutionHandler(new WaitWhenBlocked());
            }
        }
        else
        {
            setBlockedExecutionHandler(new WaitWhenBlocked());
        }

        String threadGroupName = prefs.get(PREFKEY_THREADGROUP, null);
        if (threadGroupName == null || null == exeHandlerClassName || exeHandlerClassName.length() < 1)
        {
            threadGroupName = name;
        }

        this.setThreadFactory(new CommonThreadFactory(threadGroupName));

        if (log.isDebugEnabled())
        {
            StringBuilder sb = new StringBuilder("Creating new ThreadPool with these params:\n");
            sb.append("Max Pool Size: ").append(maxSize).append("\n");
            sb.append("Min Pool Size: ").append(minSize).append("\n");
            sb.append("Keep Alive Timeout: ").append(keepAlive).append("\n");
            sb.append("Created Threads: ").append(initialThreads).append("\n");
            sb.append("BlockedExecutionHandler: ").append(exeHandlerClassName).append("\n");
            sb.append("Thread Group: ").append(threadGroupName).append("\n");
            log.debug(sb.toString());
        }
    }

    /**
     * constructor a thread pool with an initial thread
     * worker size of <code>size</code> and maximum
     * number of threads of <code>maxSize</code>. Note: if maximum
     * number of threads reaches <code>maxSize</code> and the current
     * threads are blocked, then new tasks will block until the
     * number of threads drops below <code>maxSize</code>. <code>maxSize</code>
     * is a <B>hard limit</B>.
     *
     * @param channel queue for tasks
     * @param name    prefix of thread names
     * @param size    initial size
     * @param maxSize maximum size to grow
     */

    public ThreadPool(BlockingQueue<Runnable> channel, String name, int size, int maxSize)
    {
        super(channel);

        if (name == null)
        {
            name = DEFAULT_POOL_NAME;
        }

        this.setThreadFactory(new CommonThreadFactory(AppceleratorThreadGroup.getInstance()));
        this.name = name;

        // Note on selecting pool sizes...
        // Setting the maximum pool size on the pool is
        // the size that the pool can never exceed.
        this.setMaximumPoolSize(maxSize);

        // The minPool size is set so that the pool will grow to be
        // that big, as opposed to passing the requests to the queue
        this.setMinimumPoolSize(size);

        // keep threads alive forever
        this.setKeepAliveTime(IDLE_THREAD_TIMEOUT);

        // The initial size is used to create the initial threads
        this.createThreads(Math.max(1, size));

        // in the case we have reached the max, just run the task w/o putting it in the pool
        setBlockedExecutionHandler(new WaitAndLogWhenBlocked());

        if (LOG.isDebugEnabled())
        {
            LOG.debug(
                    "creating thread pool, max threads: "
                    + maxSize
                    + ", init size: "
                    + size);
        }
    }

    /**
     * constructor a thread pool with an initial thread
     * worker size of <code>size</code> and default
     * maximum thread grow size
     *
     * @param size initial size
     */
    public ThreadPool(int size)
    {
        this(null, null, size, DEFAULT_MAXIMUM_SIZE);
    }

    /**
     * change the idle thread timeout to the number of milliseconds to block
     * before discarding the thread (killing it).
     *
     * @param idle idle thread timeout
     */
    public void setIdleThreadTimeout(long idle)
    {
        this.setKeepAliveTime(idle);
    }

    /**
     * get the idle thread timeout in milliseconds
     *
     * @return idle thread timeout
     */
    public final long getIdleThreadTimeout()
    {
        return this.getKeepAliveTime();
    }

    /**
     * return the number of tasks in the pool currently executing
     *
     * @return executing count
     */
    public final int getTasksExecutingCount()
    {
        return this.executingCount.get();
    }

    /**
     * called to destroy the thread pool and release
     * resources
     */
    public void destroy()
    {
        this.shutdownNow();
    }

    /**
     * add a task to execute on the next thread
     *
     * @param task task to add
     */
    public void addTask(Runnable task)
    {
        try
        {
            this.execute(task);
        }
        catch (InterruptedException ie)
        {
            if (LOG.isDebugEnabled())
            {
                LOG.debug("Exception adding task to thread pool: " + ie.getMessage(), ie);
            }
        }
    }

    /**
     * WaitAndLogWhenBlocked is an extension of WaitWhenBlocked that logs when the thread pool reaches the state before
     * waiting.
     */
    protected class WaitAndLogWhenBlocked extends WaitWhenBlocked
    {

        public boolean blockedAction(Runnable command) throws InterruptedException
        {
            String warning = "executing task and all threads are blocked (max thread pool limit (" + getMaximumPoolSize() + ") reached) on threadpool "
                             + name + ", minimum size = " + getMinimumPoolSize() + ", current size = " + getPoolSize() + ", current executing count = "
                             + getTasksExecutingCount() + ", bounded linked queue size = " + handOff_.size();

            LOG.warn(warning);
            return super.blockedAction(command);
        }
    }

    /**
     * Implementation of a simple thread factory to associate a thread with a runnable
     */
    private static class CommonThreadFactory implements ThreadFactory
    {
        private final ThreadGroup group;
        private int threadCount;

        /**
         * Create a thread factory, given a thread group
         *
         * @param group thread group
         */
        CommonThreadFactory(ThreadGroup group)
        {
            this.group = group;
        }

        /**
         * Create a thread factory, given a thread group
         *
         * @param name name for child thread group
         */
        CommonThreadFactory(String name)
        {
            this(AppceleratorThreadGroup.createChild(name));
        }

        /**
         * Keep track of the number of threads that have been created
         *
         * @return thread count
         */
        private synchronized int incrementThreadCount()
        {
            return this.threadCount++;
        }

        /**
         * create a new thread to run the command
         *
         * @param command runnable to run
         * @return new thread
         */
        public Thread newThread(Runnable command)
        {
            int id = this.incrementThreadCount();
            String name = this.group.getName() + "-" + id;
            return new Thread(this.group, command, name);
        }
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
        return "[ThreadPool-" + name + ":"
               + this.getTasksExecutingCount()
               + "/"
               + this.getPoolSize()
               + "/"
               + this.getMaximumPoolSize()
               + "]";
    }
}