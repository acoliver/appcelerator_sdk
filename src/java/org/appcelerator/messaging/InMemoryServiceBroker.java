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
package org.appcelerator.messaging;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executor;
import java.util.concurrent.FutureTask;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.session.ExecutableSessionManager;
import org.appcelerator.threading.GlobalThreadPool;

/**
 * InMemoryServiceBroker is an implementation of the IServiceBroker
 * that supports in-memory listeners and dispatching.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class InMemoryServiceBroker implements IServiceBroker
{
    private static final Logger LOG = Logger.getLogger(InMemoryServiceBroker.class);

    @InjectBean
    private ExecutableSessionManager executableSessionManager = null;

    // wildcard listeners
    private final List<IServiceListener> listeners = new CopyOnWriteArrayList<IServiceListener>();
    
    // direct type listeners
    private final Map<String,List<IServiceListener>> listenerMap = Collections.synchronizedMap(new HashMap<String,List<IServiceListener>>());
    
    private final class ServiceListenerRunner implements Runnable
    {
        private final Message message;

        ServiceListenerRunner(Message message)
        {
            this.message = message;
        }

        /**
         * When an object implementing interface <code>Runnable</code> is used
         * to create a thread, starting the thread causes the object's
         * <code>run</code> method to be called in that separately executing
         * thread.
         * <p/>
         * The general contract of the method <code>run</code> is that it may
         * take any action whatsoever.
         *
         * @see Thread#run()
         */
        public void run()
        {
            if (false == listeners.isEmpty())
            {
                for (IServiceListener listener : listeners)
                {
                    if (listener.accept(message))
                    {
                        listener.onMessage(message);
                    }
                }
                
            }
            List<IServiceListener> listeners = listenerMap.get(message.getType());
            if (listeners == null || listeners.isEmpty())
            {
                return;
            }
            for (IServiceListener listener : listeners)
            {
                if (listener.accept(message))
                {
                    listener.onMessage(message);
                }
            }
        }
    }

    /* (non-Javadoc)
	 * @see org.appcelerator.messaging.IMessageBroker#unregisterListener(org.appcelerator.messaging.IMessageListener)
	 */
    public boolean unregisterListener(IServiceListener listener)
    {
        boolean found = false;
        
        List<String> types = listener.getServiceTypes();
        
        // wildcard if you return null or empty list
        if (types == null || types.isEmpty())
        {
            listeners.remove(listener);
            return true;
        }
        
        for (String type : types)
        {
            if (type.equals("*"))
            {
                listeners.remove(listener);
                found = true;
                continue;
            }
            List<IServiceListener> listeners = listenerMap.get(type);
            if (listeners != null)
            {
                if (listeners.remove(listener))
                {
                    found = true;
                }
            }
        }
        
        return found;
    }

    /* (non-Javadoc)
	 * @see org.appcelerator.messaging.IMessageBroker#registerListener(org.appcelerator.messaging.IMessageListener)
	 */
    public boolean registerListener(IServiceListener listener)
    {
        List<String> types = listener.getServiceTypes();
        
        // wildcard if you return null or empty list
        if (types == null || types.isEmpty())
        {
            listeners.add(listener);
            return true;
        }
        
        for (String type : listener.getServiceTypes())
        {
            if (type.equals("*"))
            {
                listeners.add(listener);
                continue;
            }
            List<IServiceListener> listeners = listenerMap.get(type);
            if (listeners == null)
            {
                listeners = new ArrayList<IServiceListener>();
                listenerMap.put(type, listeners);
            }
            listeners.add(listener);
        }
        
        return true;
    }

    public void dispatch(Message message, Runnable callback)
    {
        if (null == message)
        {
            LOG.warn("Cannot dispatch null message");
            return;
        }
        
        if (null == message.getType())
        {
            LOG.warn("Cannot dispatch message: " + message + ", type was null");
            return;
        }
        
        if (null == message.getBroker())
        {
            message.setBroker(this);
        }
        
        
        ServiceListenerRunner runner = new ServiceListenerRunner(message);
        FutureTask<Void> future = null;
        
        if (callback!=null)
        {
            future = new FutureTask<Void>(runner,null);
        }
        
        String sessionId = message.getSessionid();
        if (null != sessionId)
        {
            Executor executor = executableSessionManager.getSessionExecutor(sessionId);
            if (null == executor)
            {
                LOG.warn("cannot dispatch message: " + message + ", no executor for session");
                return;
            }
            
            executor.execute((future==null ? runner : future));
        }
        else
        {
            Executor threadPool = GlobalThreadPool.get();
            threadPool.execute((future==null ? runner : future));
        }
        if (future!=null)
        {
            try
            {
                future.get();
            }
            catch (Exception e)
            {
                LOG.warn("problem waiting on execution of message = " + message, e);
            }

            // execute the callback
            callback.run();
        }
    }

}
