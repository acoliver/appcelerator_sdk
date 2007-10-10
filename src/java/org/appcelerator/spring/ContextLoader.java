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
package org.appcelerator.spring;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Properties;

import javax.servlet.ServletContext;

import org.apache.log4j.Logger;
import org.appcelerator.util.Util;


public class ContextLoader
{
    private static final Logger LOG = Logger.getLogger(ContextLoader.class);
    
    private String appname;
    
    public void createContext (ServletContext context) throws Exception
    {
        File path = new File(context.getRealPath("appcelerator.xml"));
        this.appname = path.getParentFile().getName();
        
        LOG.info("Setting application name to "+this.appname);
        
        Properties properties = new Properties(System.getProperties());
        
        properties.put("ipaddress",context.getAttribute("ipaddress"));
        properties.put("hostname",context.getAttribute("hostname"));
        properties.put("server.id",context.getAttribute("server.id"));
        properties.put("webapp.name",context.getAttribute("webapp.name"));
        properties.put("webapp.root",context.getAttribute("webapp.root"));

        // load our base configuration that was done at build time
        InputStream in = context.getResourceAsStream("/WEB-INF/classes/appcelerator.properties");
        if (in!=null)
        {
            LOG.info("Loading core application properties from /WEB-INF/classes/appcelerator.properties");
            properties.load(in);
        }
        
        // now load our runtime config property if it exists
        File propertiesFile = new File(".",this.appname+"-config.properties");
        if (propertiesFile.exists())
        {
            LOG.info("Loading runtime application properties "+propertiesFile.getAbsolutePath());
            FileInputStream fis = new FileInputStream(propertiesFile);
            try
            {
                properties.load(fis);
            }
            finally
            {
                if (fis!=null)
                {
                    try
                    {
                        fis.close();
                    }
                    catch (Exception ignore)
                    {
                        
                    }
                }
            }
        }
        
        context.setAttribute("appcelerator.properties", properties);
        
        LOG.info("Application configuration = "+properties);
        
        // get the spring base file
        in = context.getResourceAsStream("/WEB-INF/classes/spring-beans.xml");

        // load the spring context into memory
        String springContext = SpringUtil.replaceProperties(in,properties);
        
        File pathToSpring = new File(context.getRealPath("/WEB-INF/classes/spring-beans.xml"));
        
        // now copy our runtime spring file
        File newSpringFile = new File(pathToSpring.getParentFile(),"spring-beans-runtime.xml");
        FileOutputStream out = new FileOutputStream(newSpringFile);
        Util.copy(new ByteArrayInputStream(springContext.getBytes()), out);
        out.flush();
        out.close();
        LOG.info("created runtime spring application = "+newSpringFile.getAbsolutePath());
    }
    public void destroyContext (ServletContext context)
    {
    }
}
