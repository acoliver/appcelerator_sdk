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

/**
 * GlobalTask is a delayed task that can be scheduled to run by the GlobalTimer.
 *
 * @see org.appcelerator.threading.GlobalTimer
 */
public abstract class GlobalTask implements Runnable
{
    private ScheduledFuture future;

    /**
     * method to be implemented to perform the task
     */
    public abstract void run();

    /**
     * sets the future
     *
     * @param future scheduled future
     */
    public void setFuture(ScheduledFuture future)
    {
        this.future = future;
    }

    /**
     * cancels the task
     *
     * @return <code>true</code> if cancelled, <code>false</code> otherwise
     */
    public boolean cancel()
    {
        try
        {
            future.cancel(false);
            return GlobalTimer.get().cancel(future);
        }
        catch (Exception e)
        {
            return false;
        }
    }
}
