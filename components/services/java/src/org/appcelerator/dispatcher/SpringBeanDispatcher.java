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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.annotation.ServiceDispatcher;
import org.appcelerator.dispatcher.visitor.DispatchVisitor;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;

/**
 * A {@link @ServiceDispatcher} which loads {@link @Service} annotations from
 * a Spring BeanContext.
 */
public class SpringBeanDispatcher implements BeanFactoryAware
{
    private static final Log LOG = LogFactory.getLog(SpringBeanDispatcher.class);
    private ListableBeanFactory factory;
    private static Object instance = new SpringBeanDispatcher();
    
    private SpringBeanDispatcher() 
    {
    	LOG.debug("SpringBeanDispatcher created");
    }
    
    @ServiceDispatcher
    public static Object createDispatcher()
    {
    	LOG.debug("SpringBeanDispatcher createDispatcher");
        return instance;
    }

	public void initialize()
	{
	    for (String name : factory.getBeanDefinitionNames())
	    {
	        BeanDefinition beandef = ((BeanDefinitionRegistry)factory).getBeanDefinition(name);
	        if (beandef.isAbstract())
	        	continue;
	        Object bean = factory.getBean(name);
	        try
	        {
	            if (LOG.isDebugEnabled()) LOG.debug("attempting to register => "+name);
	            ServiceRegistry.registerServiceMethods(bean.getClass(), true, null, bean,"springBean");
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

	//no op for backwards compatibility
	public DispatchVisitor getDispatchVisitor() {return null;}
	public void setDispatchVisitor(DispatchVisitor dispatchVisitor) {}
}
