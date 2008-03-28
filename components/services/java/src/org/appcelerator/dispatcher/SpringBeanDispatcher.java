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

import javax.annotation.PostConstruct;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.ServiceDispatcher;
import org.appcelerator.messaging.Message;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.ListableBeanFactory;

/**
 * A {@link @ServiceDispatcher} which loads {@link @Service} annotations from
 * a Spring BeanContext.
 */
public class SpringBeanDispatcher implements BeanFactoryAware
{
    private static final Log LOG = LogFactory.getLog(SpringBeanDispatcher.class);
    private ListableBeanFactory factory;
    private static Object instance;
    private DispatchVisitor dispatchVisitor = new NullDispatchVisitor();
    
    public SpringBeanDispatcher() 
    {
    	LOG.info("SpringBeanDispatcher created");
    }
    @ServiceDispatcher
    public boolean dispatch (Message request, List<Message> responses)
    {
    	Object token = dispatchVisitor.startVisit(request, responses);
        boolean result = ServiceRegistry.dispatch(request, responses);
        dispatchVisitor.endVisit(token, request, responses);
        return result;
    }
    
    @PostConstruct
    public void create()
    {
        instance = this;
    }
    
    public static Object createDispatcher()
    {
        return instance;
    }

	public void initialize()
	{
	    for (String name : factory.getBeanDefinitionNames())
	    {
	        Object bean = factory.getBean(name);
	        try
	        {
	            if (LOG.isDebugEnabled()) LOG.debug("attempting to register => "+name);
	            ServiceRegistry.registerServiceMethods(bean.getClass(), true, null, bean);
				ServiceRegistry.registerDownloadableMethods(bean.getClass(), bean, true);
	        }
	        catch (Exception e)
	        {
	            LOG.error("Error registering spring bean: "+name+" as @Service");
	        }
	    }
	}

	public void setBeanFactory(BeanFactory f) throws BeansException
    {
        if (f instanceof ListableBeanFactory)
        {
            this.factory = (ListableBeanFactory)f;
        }
        else
        {
            throw new IllegalArgumentException("bean factory needs to have implemented ListableBeanFactory for SpringBeanDispatcher to work");
        }
    }

	public DispatchVisitor getDispatchVisitor() {
		return dispatchVisitor;
	}

	public void setDispatchVisitor(DispatchVisitor dispatchVisitor) {
    	LOG.info("setting dispatchVisitor="+dispatchVisitor);
		this.dispatchVisitor = dispatchVisitor;
	}

}
