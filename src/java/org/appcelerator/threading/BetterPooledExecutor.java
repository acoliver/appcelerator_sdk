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

/*
  File: PooledExecutor.java

  Originally written by Doug Lea and released into the public domain.
  This may be used for any purposes whatsoever without acknowledgment.
  Thanks for the assistance and support of Sun Microsystems Labs,
  and everyone contributing, testing, and using this code.
*/

package org.appcelerator.threading;

import java.lang.ref.Reference;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;

import EDU.oswego.cs.dl.util.concurrent.Executor;
import EDU.oswego.cs.dl.util.concurrent.SynchronizedInt;
import EDU.oswego.cs.dl.util.concurrent.ThreadFactoryUser;

/**
 * A tunable, extensible thread pool class. The main supported public
 * <p/>
 * method is <code>execute(Runnable command)</code>, which can be
 * <p/>
 * called instead of directly creating threads to execute commands.
 * <p/>
 * <p>[<a href="http://gee.cs.oswego.edu/dl/classes/EDU/oswego/cs/dl/util/concurrent/intro.html"> Introduction to this package. </a>]
 */
public class BetterPooledExecutor extends ThreadFactoryUser implements Executor
{
    protected static final Logger LOG = Logger.getLogger(BetterPooledExecutor.class);


    /**
     * The maximum pool size; used if not otherwise specified.  Default
     * <p/>
     * value is essentially infinite (Integer.MAX_VALUE)
     */

    public static final int DEFAULT_MAXIMUMPOOLSIZE = Integer.MAX_VALUE;


    /**
     * The minimum pool size; used if not otherwise specified.  Default
     * <p/>
     * value is 1.
     */

    public static final int DEFAULT_MINIMUMPOOLSIZE = 1;

    /**
     * The default threshold to use when deciding to create a new thread
     * The higher the threshold, the fewer threads
     */
    public static final int DEFAULT_THREAD_CREATION_THRESHOLD = 95;

    /**
     * The maximum time to keep worker threads alive waiting for new
     * <p/>
     * tasks; used if not otherwise specified. Default value is one
     * <p/>
     * minute (60000 milliseconds).
     */

    public static final long DEFAULT_KEEPALIVETIME = 60 * 1000;


    /**
     * The maximum number of threads allowed in pool. *
     */

    protected int maximumPoolSize_ = DEFAULT_MAXIMUMPOOLSIZE;


    /**
     * The minumum number of threads to maintain in pool. *
     */

    protected int minimumPoolSize_ = DEFAULT_MINIMUMPOOLSIZE;


    /**
     * Current pool size.  *
     */

    protected SynchronizedInt poolSize_ = new SynchronizedInt(0);


    /**
     * The maximum time for an idle thread to wait for new task. *
     */

    protected long keepAliveTime_ = DEFAULT_KEEPALIVETIME;

    /**
     * The threshold to use to decide when to create a new thread
     * based on the number of executing threads and how many
     * threads currently exist
     */
    protected int thread_creation_threshold = DEFAULT_THREAD_CREATION_THRESHOLD;

    /**
     * Shutdown flag - latches true when a shutdown method is called
     * <p/>
     * in order to disable queuing/handoffs of new tasks.
     */

    volatile protected boolean shutdown_ = false;


    /**
     * The channel used to hand off the command to a thread in the pool.
     */

    protected final BlockingQueue<Runnable> handOff_;


    /**
     * The set of active threads, declared as a map from workers to
     * <p/>
     * their threads.  This is needed by the interruptAll method.  It
     * <p/>
     * may also be useful in subclasses that need to perform other
     * <p/>
     * thread management chores.
     */

    protected final Map<Worker, Thread> threads_;


    /**
     * The current handler for unserviceable requests. *
     */

    protected BlockedExecutionHandler blockedExecutionHandler_;

    protected ClassLoader defaultClassLoader = null;

    /**
     * Keep track of how many things are actualling running (as opposed
     * to getting the number siting idle)
     */
    protected SynchronizedInt executingCount = new SynchronizedInt(0);

    /**
     * Create a new pool with all default settings
     */


    public BetterPooledExecutor()
    {

        this(new LinkedBlockingQueue<Runnable>(), DEFAULT_MAXIMUMPOOLSIZE);
    }


    /**
     * Create a new pool with all default settings except
     * <p/>
     * for maximum pool size.
     */


    public BetterPooledExecutor(int maxPoolSize)
    {

        this(new LinkedBlockingQueue<Runnable>(), maxPoolSize);

    }


    /**
     * Create a new pool that uses the supplied Channel for queuing, and
     * <p/>
     * with all default parameter settings.
     */


    public BetterPooledExecutor(BlockingQueue<Runnable> channel)
    {

        this(channel, DEFAULT_MAXIMUMPOOLSIZE);

    }


    /**
     * Create a new pool that uses the supplied Channel for queuing, and
     * <p/>
     * with all default parameter settings except for maximum pool size.
     */


    public BetterPooledExecutor(BlockingQueue<Runnable> channel, int maxPoolSize)
    {
        defaultClassLoader = Thread.currentThread().getContextClassLoader();

        maximumPoolSize_ = maxPoolSize;

        handOff_ = channel;

        runWhenBlocked();

        threads_ = new HashMap<Worker, Thread>();

    }

    public static Field threadLocalsField;
    public static Field inheritableThreadLocalsField;
    public static Field tableField;
    public static Method clearMethod;
    public static Method expunge;

    static
    {
        try
        {
            threadLocalsField = Thread.class.getDeclaredField("threadLocals");
            threadLocalsField.setAccessible(true);
            inheritableThreadLocalsField = Thread.class.getDeclaredField("inheritableThreadLocals");
            inheritableThreadLocalsField.setAccessible(true);
        }
        catch (Exception e)
        {
            LOG.error("Error with reflective fields", e);
        }
    }

    static void expungeThreadLocalMap(Thread t, String name) throws Exception
    {
        Field f;
        if ("threadLocals".equals(name))
        {
            f = threadLocalsField;
        }
        else if ("inheritableThreadLocals".equals(name))
        {
            f = inheritableThreadLocalsField;
        }
        else
        {
            return;
        }

        Object m = f.get(t);
        if (m != null)
        {
            if (tableField == null)
            {
                tableField = m.getClass().getDeclaredField("table");
                tableField.setAccessible(true);
            }

            Object entryObject[] = (Object[]) tableField.get(m);

            if (entryObject != null && entryObject.length > 0)
            {
                if (clearMethod == null)
                {
                    clearMethod = Reference.class.getDeclaredMethod("clear", (Class[]) null);
                    clearMethod.setAccessible(true);
                }

                for (int c = 0; c < entryObject.length; c++)
                {
                    if (entryObject[c] != null)
                    {
                        if (clearMethod != null)
                        {
                            clearMethod.invoke(entryObject[c], (Object[]) null);
                        }
                    }
                }

                if (expunge == null)
                {
                    expunge = m.getClass().getDeclaredMethod("expungeStaleEntries", (Class[]) null);
                    expunge.setAccessible(true);
                }
                expunge.invoke(m, (Object[]) null);
            }
            f.set(t, null);
        }
    }

    static void expungeThreadLocal(Thread t) throws Exception
    {
        expungeThreadLocalMap(t, "threadLocals");
        expungeThreadLocalMap(t, "inheritableThreadLocals");
    }

    /**
     * Return the maximum number of threads to simultaneously execute
     * <p/>
     * New unqueued requests will be handled according to the current
     * <p/>
     * blocking policy once this limit is exceeded.
     */

    public synchronized int getMaximumPoolSize()
    {

        return maximumPoolSize_;

    }


    /**
     * Set the maximum number of threads to use. Decreasing the pool
     * <p/>
     * size will not immediately kill existing threads, but they may
     * <p/>
     * later die when idle.
     *
     * @throws IllegalArgumentException if less or equal to zero.
     *                                  <p/>
     *                                  (It is
     *                                  <p/>
     *                                  not considered an error to set the maximum to be less than than
     *                                  <p/>
     *                                  the minimum. However, in this case there are no guarantees
     *                                  <p/>
     *                                  about behavior.)
     */

    public synchronized void setMaximumPoolSize(int newMaximum)
    {

        if (newMaximum <= 0) throw new IllegalArgumentException();

        maximumPoolSize_ = newMaximum;

    }


    /**
     * Return the minimum number of threads to simultaneously execute.
     * <p/>
     * (Default value is 1).  If fewer than the mininum number are
     * <p/>
     * running upon reception of a new request, a new thread is started
     * <p/>
     * to handle this request.
     */

    public synchronized int getMinimumPoolSize()
    {

        return minimumPoolSize_;

    }


    /**
     * Set the minimum number of threads to use.
     *
     * @throws IllegalArgumentException if less than zero. (It is not
     *                                  <p/>
     *                                  considered an error to set the minimum to be greater than the
     *                                  <p/>
     *                                  maximum. However, in this case there are no guarantees about
     *                                  <p/>
     *                                  behavior.)
     */

    public synchronized void setMinimumPoolSize(int newMinimum)
    {

        if (newMinimum < 0) throw new IllegalArgumentException();

        minimumPoolSize_ = newMinimum;

    }


    /**
     * Return the current number of active threads in the pool.  This
     * <p/>
     * number is just a snaphot, and may change immediately upon
     * <p/>
     * returning
     */

    public int getPoolSize()
    {

        return poolSize_.get();

    }


    /**
     * Return the number of milliseconds to keep threads alive waiting
     * <p/>
     * for new commands. A negative value means to wait forever. A zero
     * <p/>
     * value means not to wait at all.
     */

    public synchronized long getKeepAliveTime()
    {

        return keepAliveTime_;

    }


    /**
     * Set the number of milliseconds to keep threads alive waiting for
     * <p/>
     * new commands. A negative value means to wait forever. A zero
     * <p/>
     * value means not to wait at all.
     */

    public synchronized void setKeepAliveTime(long msecs)
    {

        keepAliveTime_ = msecs;

    }


    /**
     * Get the handler for blocked execution *
     */

    protected synchronized BlockedExecutionHandler getBlockedExecutionHandler()
    {

        return blockedExecutionHandler_;

    }


    /**
     * Set the handler for blocked execution *
     */

    protected synchronized void setBlockedExecutionHandler(BlockedExecutionHandler h)
    {

        blockedExecutionHandler_ = h;

    }


    /**
     * Create and start a thread to handle a new command.  Call only
     * <p/>
     * when holding lock.
     */

    protected void addThread(Runnable command)
    {
        Worker worker = new Worker(command);

        Thread thread = getThreadFactory().newThread(worker);

        synchronized (threads_)
        {
            threads_.put(worker, thread);
            poolSize_.increment();
        }
        if (LOG.isDebugEnabled())
        {
            LOG.debug("Adding Thread: " + thread + " to ThreadPool: " + this + ", new size: " + poolSize_.get());
        }
        thread.start();
    }

    /**
     * Create and start up to numberOfThreads threads in the pool.
     * <p/>
     * Return the number created. This may be less than the number
     * <p/>
     * requested if creating more would exceed maximum pool size bound.
     */

    public int createThreads(int numberOfThreads)
    {

        int ncreated = 0;

        for (int i = 0; i < numberOfThreads; ++i)
        {

            synchronized (this)
            {

                if (poolSize_.get() < maximumPoolSize_)
                {

                    addThread(null);

                    ++ncreated;

                }

                else

                {
                    break;
                }

            }

        }

        return ncreated;

    }


    /**
     * Interrupt all threads in the pool, causing them all to
     * <p/>
     * terminate. Assuming that executed tasks do not disable (clear)
     * <p/>
     * interruptions, each thread will terminate after processing its
     * <p/>
     * current task. Threads will terminate sooner if the executed tasks
     * <p/>
     * themselves respond to interrupts.
     */

    public void interruptAll()
    {

        synchronized (threads_)
        {
            for (Iterator it = threads_.values().iterator(); it.hasNext();)
            {
                Thread t = (Thread) (it.next());
                t.interrupt();
            }
        }
    }


    /**
     * Interrupt all threads and disable construction of new
     * <p/>
     * threads. Any tasks entered after this point will be discarded. A
     * <p/>
     * shut down pool cannot be restarted.
     */

    public void shutdownNow()
    {

        shutdownNow(new DiscardWhenBlocked());

    }


    /**
     * Interrupt all threads and disable construction of new
     * <p/>
     * threads. Any tasks entered after this point will be handled by
     * <p/>
     * the given BlockedExecutionHandler.  A shut down pool cannot be
     * <p/>
     * restarted.
     */

    public synchronized void shutdownNow(BlockedExecutionHandler handler)
    {

        setBlockedExecutionHandler(handler);

        shutdown_ = true; // don't allow new tasks

        minimumPoolSize_ = maximumPoolSize_ = 0; // don't make new threads

        interruptAll(); // interrupt all existing threads

    }


    /**
     * Terminate threads after processing all elements currently in
     * <p/>
     * queue. Any tasks entered after this point will be discarded. A
     * <p/>
     * shut down pool cannot be restarted.
     */

    public void shutdownAfterProcessingCurrentlyQueuedTasks()
    {

        shutdownAfterProcessingCurrentlyQueuedTasks(new DiscardWhenBlocked());

    }


    /**
     * Terminate threads after processing all elements currently in
     * <p/>
     * queue. Any tasks entered after this point will be handled by the
     * <p/>
     * given BlockedExecutionHandler.  A shut down pool cannot be
     * <p/>
     * restarted.
     */

    public synchronized void shutdownAfterProcessingCurrentlyQueuedTasks(BlockedExecutionHandler handler)
    {

        setBlockedExecutionHandler(handler);

        shutdown_ = true;

        if (poolSize_.get() == 0) // disable new thread construction when idle

        {
            minimumPoolSize_ = maximumPoolSize_ = 0;
        }

    }


    /**
     * Return true if a shutDown method has succeeded in terminating all
     * <p/>
     * threads.
     */

    public synchronized boolean isTerminatedAfterShutdown()
    {

        return shutdown_ && poolSize_.get() == 0;

    }


    /**
     * Wait for a shutdown pool to fully terminate, or until the timeout
     * <p/>
     * has expired. This method may only be called <em>after</em>
     * <p/>
     * invoking shutdownNow or
     * <p/>
     * shutdownAfterProcessingCurrentlyQueuedTasks.
     *
     * @param maxWaitTime the maximum time in milliseconds to wait
     * @return true if the pool has terminated within the max wait period
     * @throws IllegalStateException if shutdown has not been requested
     * @throws InterruptedException  if the current thread has been interrupted in the course of waiting
     */

    public synchronized boolean awaitTerminationAfterShutdown(long maxWaitTime) throws InterruptedException
    {

        if (!shutdown_)

        {
            throw new IllegalStateException();
        }

        if (poolSize_.get() == 0)

        {
            return true;
        }

        long waitTime = maxWaitTime;

        if (waitTime <= 0)

        {
            return false;
        }

        long start = System.currentTimeMillis();

        for (; ;)
        {

            wait(waitTime);

            if (poolSize_.get() == 0)

            {
                return true;
            }

            waitTime = maxWaitTime - (System.currentTimeMillis() - start);

            if (waitTime <= 0)

            {
                return false;
            }

        }

    }


    /**
     * Wait for a shutdown pool to fully terminate.  This method may
     * <p/>
     * only be called <em>after</em> invoking shutdownNow or
     * <p/>
     * shutdownAfterProcessingCurrentlyQueuedTasks.
     *
     * @throws IllegalStateException if shutdown has not been requested
     * @throws InterruptedException  if the current thread has been interrupted in the course of waiting
     */

    public synchronized void awaitTerminationAfterShutdown() throws InterruptedException
    {

        if (!shutdown_)

        {
            throw new IllegalStateException();
        }

        while (poolSize_.get() > 0)

        {
            wait();
        }

    }


    /**
     * Remove all unprocessed tasks from pool queue, and return them in
     * <p/>
     * a java.util.List. Thsi method should be used only when there are
     * <p/>
     * not any active clients of the pool. Otherwise you face the
     * <p/>
     * possibility that the method will loop pulling out tasks as
     * <p/>
     * clients are putting them in.  This method can be useful after
     * <p/>
     * shutting down a pool (via shutdownNow) to determine whether there
     * <p/>
     * are any pending tasks that were not processed.  You can then, for
     * <p/>
     * example execute all unprocessed commands via code along the lines
     * <p/>
     * of:
     * <p/>
     * <p/>
     * <p/>
     * <pre>
     * <p/>
     *   List tasks = pool.drain();
     * <p/>
     *   for (Iterator it = tasks.iterator(); it.hasNext();)
     * <p/>
     *     ( (Runnable)(it.next()) ).run();
     * <p/>
     * </pre>
     */

    public List drain()
    {

        boolean wasInterrupted = false;

        ArrayList<Object> tasks = new ArrayList<Object>();

        for (; ;)
        {

            try
            {

                Object x = handOff_.poll(0, TimeUnit.MILLISECONDS);

                if (x == null)

                {
                    break;
                }

                else

                {
                    tasks.add(x);
                }

            }

            catch (InterruptedException ex)
            {

                wasInterrupted = true; // postpone re-interrupt until drained

            }

        }

        if (wasInterrupted) Thread.currentThread().interrupt();

        return tasks;

    }


    /**
     * Cleanup method called upon termination of worker thread.
     */

    protected void workerDone(Worker w)
    {

        synchronized (threads_)
        {
            threads_.remove(w);
        }

        if (poolSize_.get() == 0 && shutdown_)
        {
            maximumPoolSize_ = minimumPoolSize_ = 0; // disable new threads

            synchronized (this)
            {
                notifyAll(); // notify awaitTerminationAfterShutdown
            }
        }
    }


    /**
     * Get a task from the handoff queue, or null if shutting down.
     */

    protected Runnable getTask() throws InterruptedException
    {

        long waitTime;

        waitTime = (shutdown_) ? 0 : keepAliveTime_;

        if (waitTime >= 0)
        {
            return (handOff_.poll(waitTime, TimeUnit.MILLISECONDS));
        }

        return (handOff_.take());
    }


    /**
     * Class defining the basic run loop for pooled threads.
     */

    protected class Worker implements Runnable
    {

        protected Runnable firstTask_;


        protected Worker(Runnable firstTask)
        {
            firstTask_ = firstTask;
        }


        private void run(Runnable task)
        {
            try
            {

                long started = 0;

                if (LOG.isDebugEnabled())
                {
                    started = System.currentTimeMillis();
                    LOG.debug("Executing task: " + task + " in ThreadPool: " + BetterPooledExecutor.this);
                }

                task.run();

                if (LOG.isDebugEnabled())
                {
                    long time = System.currentTimeMillis() - started;
                    LOG.debug("Executed task: " + task + " in ThreadPool: " + BetterPooledExecutor.this + " - execution took: " + time + " ms");
                }

            }
            catch (Throwable t)
            {
                // ignore
                LOG.warn("ThreadPool: " + BetterPooledExecutor.this + " raised runtime exception in worker: " + this, t);
            }
            finally
            {
                try
                {
                    expungeThreadLocal(Thread.currentThread());
                }
                catch (Exception e)
                {
                    LOG.warn("Error trying to clean up thread local", e);
                }
            }
        }

        public void run()
        {

            try
            {

                Runnable task = firstTask_;

                firstTask_ = null; // enable GC


                if (task != null)
                {

                    run(task);

                    task = null;

                }


                while (true)
                {
                    while ((task = getTask()) != null)
                    {
                        run(task);
                        task = null;
                    }
                    if (shutdown_ | poolSize_.decrement() > minimumPoolSize_)
                    {
                        break;
                    }
                    else
                    {
                        poolSize_.increment();
                    }
                }

            }

            catch (InterruptedException ex)
            {
            } // fall through
            finally
            {
                workerDone(this);
            }
        }

    }


    /**
     * Class for actions to take when execute() blocks. Uses Strategy
     * <p/>
     * pattern to represent different actions. You can add more in
     * <p/>
     * subclasses, and/or create subclasses of these. If so, you will
     * <p/>
     * also want to add or modify the corresponding methods that set the
     * <p/>
     * current blockedExectionHandler_.
     */

    protected interface BlockedExecutionHandler
    {

        /**
         * Return true if successfully handled so, execute should
         * <p/>
         * terminate; else return false if execute loop should be retried.
         */

        boolean blockedAction(Runnable command) throws InterruptedException;

    }


    /**
     * Class defining Run action. *
     */

    protected class RunWhenBlocked implements BlockedExecutionHandler
    {

        public boolean blockedAction(Runnable command)
        {

            command.run();

            return true;

        }

    }


    /**
     * Set the policy for blocked execution to be that the current
     * <p/>
     * thread executes the command if there are no available threads in
     * <p/>
     * the pool.
     */

    public void runWhenBlocked()
    {

        setBlockedExecutionHandler(new RunWhenBlocked());

    }


    /**
     * Class defining Wait action. *
     */

    protected class WaitWhenBlocked implements BlockedExecutionHandler
    {

        public boolean blockedAction(Runnable command) throws InterruptedException
        {

            handOff_.put(command);

            return true;

        }

    }


    /**
     * Set the policy for blocked execution to be to wait until a thread
     * <p/>
     * is available.
     */

    public void waitWhenBlocked()
    {

        setBlockedExecutionHandler(new WaitWhenBlocked());

    }


    /**
     * Class defining Discard action. *
     */

    protected class DiscardWhenBlocked implements BlockedExecutionHandler
    {

        public boolean blockedAction(Runnable command)
        {

            return true;

        }

    }


    /**
     * Set the policy for blocked execution to be to return without
     * <p/>
     * executing the request.
     */

    public void discardWhenBlocked()
    {

        setBlockedExecutionHandler(new DiscardWhenBlocked());

    }


    /**
     * Class defining Abort action. *
     */

    protected class AbortWhenBlocked implements BlockedExecutionHandler
    {

        public boolean blockedAction(Runnable command)
        {

            throw new RuntimeException("Pool is blocked");

        }

    }


    /**
     * Set the policy for blocked execution to be to
     * <p/>
     * throw a RuntimeException.
     */

    public void abortWhenBlocked()
    {

        setBlockedExecutionHandler(new AbortWhenBlocked());

    }


    /**
     * Class defining DiscardOldest action.  Under this policy, at most
     * <p/>
     * one old unhandled task is discarded.  If the new task can then be
     * <p/>
     * handed off, it is.  Otherwise, the new task is run in the current
     * <p/>
     * thread (i.e., RunWhenBlocked is used as a backup policy.)
     */

    protected class DiscardOldestWhenBlocked implements BlockedExecutionHandler
    {

        public boolean blockedAction(Runnable command) throws InterruptedException
        {

            handOff_.poll(0, TimeUnit.MILLISECONDS);

            if (!handOff_.offer(command, 0, TimeUnit.MILLISECONDS))

            {
                command.run();
            }

            return true;

        }

    }


    /**
     * Set the policy for blocked execution to be to discard the oldest
     * <p/>
     * unhandled request
     */

    public void discardOldestWhenBlocked()
    {

        setBlockedExecutionHandler(new DiscardOldestWhenBlocked());

    }


    /**
     * Arrange for the given command to be executed by a thread in this
     * <p/>
     * pool.  The method normally returns when the command has been
     * <p/>
     * handed off for (possibly later) execution.
     */

    public void execute(final Runnable command) throws InterruptedException
    {

        ClassLoader orginialClassLoader = Thread.currentThread().getContextClassLoader();
        if (orginialClassLoader == null)
        {
            orginialClassLoader = defaultClassLoader;
        }
        final ClassLoader cl = orginialClassLoader;
        Runnable task = new Runnable()
        {
            public void run()
            {
                final ClassLoader beforeTask = Thread.currentThread().getContextClassLoader();
                Thread.currentThread().setContextClassLoader(cl);
                try
                {
                    executingCount.increment();
                    command.run();
                }
                finally
                {
                    executingCount.decrement();
                    Thread.currentThread().setContextClassLoader(beforeTask);
                }
            }

            public String toString()
            {
                return command.toString();
            }
        };

        for (; ;)
        {
            if (!shutdown_)
            {
                // Ensure minimum number of threads
                if (poolSize_.get() < minimumPoolSize_)
                {
                    addThread(task);
                    return;
                }

                // decide whether or not to create a new thread
                if (((float) executingCount.get() / (float) poolSize_.get() * 100f) > thread_creation_threshold)
                {
                    addThread(null);
                }

                // Try to give to existing thread
                if (handOff_.offer(task, 0, TimeUnit.MILLISECONDS))
                {
                    return;
                }

                // If cannot handoff, block until put succeeds
                handOff_.put(task);
                return;
            }
            if (getBlockedExecutionHandler().blockedAction(task))
            {
                return;
            }
        }
    }
}