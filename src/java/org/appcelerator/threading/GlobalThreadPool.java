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

import java.util.concurrent.LinkedBlockingQueue;

/**
 *
 */
public class GlobalThreadPool
{
    /**
     * minimum thread size
     */
    private static final int minThreadSize = Integer.valueOf(System.getProperty("app.threading.minthreads", "10"));
    /**
     * max thread size for the pool
     */
    private static final int maxThreadSize = Integer.valueOf(System.getProperty("app.threading.maxthreads", String.valueOf(minThreadSize * 3)));
    /**
     * the backing global thread pool
     */
    private static final ThreadPool threadPool = ThreadPoolFactory.createPool(new LinkedBlockingQueue<Runnable>(), "GlobalThreadPool", minThreadSize, maxThreadSize);

    static
    {
        threadPool.setIdleThreadTimeout(Long.valueOf(System.getProperty("app.threading.idletimeout", String.valueOf(ThreadPool.DEFAULT_KEEPALIVE))));
    }

    /**
     * return a global thread pool reference
     *
     * @return global thread pool
     */
    public static ThreadPool get()
    {
        return threadPool;
    }
}
