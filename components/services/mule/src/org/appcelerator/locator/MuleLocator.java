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
package org.appcelerator.locator;

import javax.servlet.ServletContext;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.appcelerator.service.ServiceRegistry;
import org.mule.config.builders.MuleXmlConfigurationBuilder;

/**
 * Utility class which will auto-register all @Service method implementations in the 
 * JVM classpath. This class implements the @ServiceDispatcher annotation.
 */
public class MuleLocator implements ServiceLocator
{
    @SuppressWarnings("unused")
    private static final Log LOG = LogFactory.getLog(MuleLocator.class);

    static {
        ServiceRegistry.registerLocator(new MuleLocator());
    }
    
    public void findServices() {
        try {
            MuleXmlConfigurationBuilder builder = new MuleXmlConfigurationBuilder();
            builder.configure("mule-config.xml");
        } catch (Exception e) {
            e.printStackTrace();
        }        
    }
    
    public void setServletContext(ServletContext sc) {        
    }
}
