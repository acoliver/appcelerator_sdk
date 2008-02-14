/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
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
package org.appcelerator.v21.dispatcher;

import java.util.List;

import org.apache.log4j.Logger;
import org.appcelerator.messaging.Message;
import org.appcelerator.v21.annotation.AnnotationHelper;
import org.appcelerator.v21.annotation.Service;
import org.appcelerator.v21.annotation.ServiceDispatcher;

/**
 * Utility class which will auto-register all @Service method implementations in the 
 * JVM classpath. This class implements the @ServiceDispatcher annotation.
 */
public class ServiceAnnotationDispatcher
{
    private static final Logger LOG = Logger.getLogger(ServiceAnnotationDispatcher.class);
    
    /**
     * called when the dispatcher is loaded
     */
    public void initialize ()
    {
        for (Class<? extends Object> serviceClass : AnnotationHelper.findAnnotation(Service.class))
        {
            try
            {
                ServiceRegistry.registerServiceMethods(serviceClass,false,null);
            }
            catch (Exception ex)
            {
                LOG.error("Error loading services from annotations in classpath",ex);
            }
        }
    }
    
    @ServiceDispatcher
    public boolean dispatch (Message request, List<Message> responses)
    {
        return ServiceRegistry.dispatch(request, responses);
    }
}
