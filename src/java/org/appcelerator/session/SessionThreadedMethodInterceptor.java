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

import java.lang.reflect.Method;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Executor;
import java.util.concurrent.FutureTask;

import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import org.apache.log4j.Logger;
import org.appcelerator.spring.CgiLibMethodInvocation;
import org.appcelerator.util.ClassUtil;

/**
 * SessionThreadedMethodInterceptor
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class SessionThreadedMethodInterceptor implements MethodInterceptor
{
    private static final Logger LOG = Logger.getLogger(SessionThreadedMethodInterceptor.class);
    private ExecutableSessionManager executableSessionManager;

    public SessionThreadedMethodInterceptor(ExecutableSessionManager executableSessionManager)
    {
        this.executableSessionManager = executableSessionManager;
    }

    public Object intercept(Object object, Method method, Object[] args, MethodProxy methodProxy) throws Throwable
    {
        Executor executor = null;
        Set<Class> interfaces = ClassUtil.getAllInterfaces(object.getClass());

        if (interfaces.contains(IExecutableSession.class))
        {
            executor = ((IExecutableSession) object).getExecutor();
        }
        else if (interfaces.contains(ISession.class))
        {
            executor = executableSessionManager.getSessionExecutor(((ISession) object).getSessionId());
        }
        else
        {
            for (Object arg : args)
            {
                interfaces = ClassUtil.getAllInterfaces(arg.getClass());

                if (interfaces.contains(IExecutableSession.class))
                {
                    executor = ((IExecutableSession) arg).getExecutor();
                    break;
                }
                else if (interfaces.contains(ISession.class))
                {
                    executor = executableSessionManager.getSessionExecutor(((ISession) arg).getSessionId());
                    break;
                }
            }
        }

        if (null != executor)
        {
            final CgiLibMethodInvocation invocation = new CgiLibMethodInvocation(object, method, args, methodProxy);
            FutureTask<Object> futureTask = new FutureTask<Object>(new Callable<Object>()
            {

                /**
                 * Computes a result, or throws an exception if unable to do so.
                 *
                 * @return computed result
                 * @throws Exception if unable to compute a result
                 */
                public Object call() throws Exception
                {
                    try
                    {
                        return invocation.proceed();
                    }
                    catch (Throwable throwable)
                    {
                        if (throwable instanceof Exception)
                        {
                            throw (Exception) throwable;
                        }
                        else
                        {
                            throw new RuntimeException(throwable);
                        }
                    }
                }
            });
            executor.execute(futureTask);
            return futureTask.get();
        }
        else
        {
            throw new InvalidSessionException("unable to invoke " + method.getDeclaringClass().getSimpleName() + "." + method.getName() + ": could not find session");
        }
    }
}