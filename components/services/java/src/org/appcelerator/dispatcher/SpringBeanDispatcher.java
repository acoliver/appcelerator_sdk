/**
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.appcelerator.dispatcher;

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.ServiceDispatcher;
import org.appcelerator.messaging.Message;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;

/**
 * A {@link @ServiceDispatcher} which loads {@link @Service} annotations from
 * a Spring BeanContext.
 */
public class SpringBeanDispatcher implements BeanPostProcessor
{
    private static final Log LOG = LogFactory.getLog(SpringBeanDispatcher.class);
    
    @ServiceDispatcher
    public boolean dispatch (Message request, List<Message> responses)
    {
        return ServiceRegistry.dispatch(request, responses);
    }

    public Object postProcessAfterInitialization(Object bean, String beanName)
            throws BeansException
    {
        try
        {
            ServiceRegistry.registerServiceMethods(bean.getClass(), true, null);
        }
        catch (Exception e)
        {
            LOG.error("Error registering spring bean: "+beanName+" as @Service");
        }
        return bean;
    }

    public Object postProcessBeforeInitialization(Object bean, String beanName)
            throws BeansException
    {
        return bean;
    }
}
