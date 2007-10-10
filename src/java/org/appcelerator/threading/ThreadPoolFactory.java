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

/**
 * Factory for thread pools.
 */
public class ThreadPoolFactory
{
    private static final Logger LOG = Logger.getLogger(ThreadPoolFactory.class);

    /**
     * creates a thread pool with the specified name
     *
     * @param name thread pool name
     * @return thread pool
     */
    public static ThreadPool createPool(String name)
    {
        return createPool(name, 1, ThreadPool.DEFAULT_MAXIMUM_SIZE);
    }

    /**
     * create thread pool with specified name, initial size and max size
     *
     * @param name thread pool name
     * @param size initial size
     * @param max  max size
     * @return thread pool
     */
    public static ThreadPool createPool(String name, int size, int max)
    {
        if (LOG.isDebugEnabled())
        {
            LOG.debug("Creating ThreadPool with name: " + name + " size: " + size + " max: " + max);
        }
        return new ThreadPool(name, size, max);
    }

    /**
     * create thread pool with specified name and preferences configuration
     *
     * @param prefs preferences
     * @param name  thread pool name
     * @return thread pool
     */
    public static ThreadPool createPool(Preferences prefs, String name)
    {
        prefs.put(ThreadPool.PREFKEY_NAME, name);
        return new ThreadPool(new LinkedBlockingQueue<Runnable>(), prefs);
    }

    /**
     * create thread pool with channel, thread pool name, initial size, and max size.
     *
     * @param channel channel queue for runnables
     * @param name    thread pool name
     * @param size    initial size
     * @param max     max size
     * @return thread pool
     */
    public static ThreadPool createPool(BlockingQueue<Runnable> channel, String name, int size, int max)
    {
        return new ThreadPool(channel, name, size, max);
    }
}
