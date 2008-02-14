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
package org.appcelerator.service;

import org.apache.log4j.Logger;
import org.appcelerator.spring.AppBeanPostProcessor;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;

public class ServiceBundle
{
    private static final Logger LOG = Logger.getLogger(ServiceBundle.class);
    private String name;
    private int release;
    private DefaultListableBeanFactory factory;
    private boolean activated;
    private AppBeanPostProcessor processor = new AppBeanPostProcessor();
    
    public ServiceBundle ()
    {
    }
    
    public ServiceBundle(String name, int release,
            DefaultListableBeanFactory factory)
    {
        super();
        this.name = name;
        this.release = release;
        this.factory = factory;
        this.activated = false;
        
        processor.postProcessBeanFactory(factory);
        factory.addBeanPostProcessor(processor);
    }

    public String getName()
    {
        return name;
    }
    public void setName(String name)
    {
        this.name = name;
    }
    public int getRelease()
    {
        return release;
    }
    public void setRelease(int release)
    {
        this.release = release;
    }
    public DefaultListableBeanFactory getFactory()
    {
        return factory;
    }
    public void setFactory(DefaultListableBeanFactory factory)
    {
        this.factory = factory;
    }
    public boolean isActivated()
    {
        return activated;
    }
    public void setActivated(boolean activated)
    {
        this.activated = activated;
    }
    public void deactivate ()
    {
        if (this.activated)
        {
            ClassLoader oldCL = Thread.currentThread().getContextClassLoader();
            try
            {
                Thread.currentThread().setContextClassLoader(factory.getBeanClassLoader());
                this.activated = false;
                String beanNames [] = factory.getBeanDefinitionNames();
                for (String name : beanNames)
                {
                    if (factory.isSingleton(name))
                    {
                        factory.destroySingleton(name);
                        if (LOG.isDebugEnabled())
                        {
                            LOG.debug("destroying  => "+name);
                        }
                    }
                }
            }
            finally
            {
                Thread.currentThread().setContextClassLoader(oldCL);
            }
        }
    }
    public void activate ()
    {
        if (!this.activated)
        {
            ClassLoader oldCL = Thread.currentThread().getContextClassLoader();
            try
            {
                Thread.currentThread().setContextClassLoader(factory.getBeanClassLoader());
                this.activated = true;
                String beanNames [] = factory.getBeanDefinitionNames();
                for (String name : beanNames)
                {
                    if (factory.isSingleton(name))
                    {
                        Object bean = factory.getBean(name);
                        if (LOG.isDebugEnabled())
                        {
                            LOG.debug("created: "+bean+" => "+name);
                        }
                    }
                }
            }
            finally
            {
                Thread.currentThread().setContextClassLoader(oldCL);
            }
        }
    }
}
