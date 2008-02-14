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

/**
 * SingleThreadedExecutor
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class SingleThreadedExecutor extends AbstractSingleThreadedDispatcher implements Executor
{
    private Thread thread;
    private boolean reentrant;

    public SingleThreadedExecutor(Object source)
    {
        this(source, true);
    }
    
    public SingleThreadedExecutor(Object source, boolean reentrant)
    {
        super(source, GlobalThreadPool.get());
        this.reentrant = reentrant;
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
    protected void handle(Object obj)
    {
        try
        {
            thread = Thread.currentThread();
            Runnable runnable = (Runnable) obj;
            runnable.run();
        }
        finally
        {
            thread = null;
        }
    }

    /**
     * Executes the given command at some time in the future.  The command
     * may execute in a new thread, in a pooled thread, or in the calling
     * thread, at the discretion of the <tt>Executor</tt> implementation.
     *
     * @param command the runnable task
     * @throws java.util.concurrent.RejectedExecutionException
     *                              if this task cannot be
     *                              accepted for execution.
     * @throws NullPointerException if command is null
     */
    public void execute(Runnable command)
    {
        if (true == reentrant)
        {
            if (null != thread && Thread.currentThread().equals(thread))
            {
                command.run();
            }
            else
            {
                send(command);
            }
        }
        else
        {
            send(command);
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
        return getClass().getSimpleName();
    }
}