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

import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;


/**
 *
 */
public class GlobalTimer
{
    /**
     * thread pool size for the global timer
     */
    private static final int THREAD_POOL_SIZE = 5;
    /**
     * singleton instance
     */
    private static final GlobalTimer globalTimer = new GlobalTimer();
    /**
     * scheduler
     */
    private static final ScheduledThreadPoolExecutor scheduler = new ScheduledThreadPoolExecutor(THREAD_POOL_SIZE);

    /**
     * return singleton global timer instance
     *
     * @return global timer
     */
    public static GlobalTimer get()
    {
        return globalTimer;
    }

    /**
     * private constructor for global timer
     *
     * @see GlobalTimer#get()
     */
    private GlobalTimer()
    {
    }

    /**
     * schedule a task
     *
     * @param task  task to run
     * @param delay delay
     * @param unit  time unit for delay
     */
    public void schedule(GlobalTask task, long delay, TimeUnit unit)
    {
        task.setFuture(scheduler.schedule(task, delay, unit));
    }

    /**
     * schedule a task to run at a fixed rate
     *
     * @param task         task to run
     * @param initialDelay initial delay
     * @param period       period for rate
     * @param unit         unit for period
     */
    public void scheduleAtFixedRate(GlobalTask task, long initialDelay, long period, TimeUnit unit)
    {
        task.setFuture(scheduler.scheduleAtFixedRate(task, initialDelay, period, unit));
    }

    /**
     * schedule a task to run with a fixed delay
     *
     * @param task         task to run
     * @param initialDelay initial delay
     * @param delay        fixed delay
     * @param unit         unit for delay
     */
    public void scheduleWithFixedDelay(GlobalTask task, long initialDelay, long delay, TimeUnit unit)
    {
        task.setFuture(scheduler.scheduleWithFixedDelay(task, initialDelay, delay, unit));
    }

    /**
     * cancel a task
     *
     * @param task task to cancel
     * @return <code>true</code> if task was cancelled, <code>false</code> otherwise
     */
    public boolean cancel(ScheduledFuture task)
    {
        return scheduler.remove((Runnable) task);
    }
}
