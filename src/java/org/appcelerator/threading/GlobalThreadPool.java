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

import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

/**
 * global thread pool implementation
 */
public class GlobalThreadPool
{
    private static final ExecutorService pool = Executors.newCachedThreadPool(new ThreadFactory()
    {
        private int count = 0;

        public Thread newThread(Runnable r)
        {
            return new Thread(AppceleratorThreadGroup.getInstance(),r,"GlobalThreadPoolThread-"+(count++));
        }
    });
    
    /**
     * return a global thread pool reference
     *
     * @return global thread pool
     */
    public static Executor get()
    {
        return pool;
    }
}
