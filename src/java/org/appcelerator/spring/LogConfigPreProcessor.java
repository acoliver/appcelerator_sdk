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

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.appcelerator.util.Util;

/**
 * simple preprocessor which will set the write webapp.root context property inside the 
 * log4j.properties file
 * 
 */
public class LogConfigPreProcessor implements ServletContextListener
{

    public void contextDestroyed(ServletContextEvent arg0)
    {
    }

    public void contextInitialized(ServletContextEvent arg0)
    {
        try
        {
            File path = new File(arg0.getServletContext().getRealPath("appcelerator.xml"));
            File logconfig = new File(arg0.getServletContext().getRealPath("/WEB-INF/classes/appcelerator.log4j.properties"));
            FileInputStream in = new FileInputStream(logconfig);
            String content = Util.copyToString(in);
            in.close();
            
            arg0.getServletContext().setAttribute("webapp.root", path.getParentFile().getAbsolutePath());
            arg0.getServletContext().setAttribute("webapp.name", path.getParentFile().getName());
            
            content = content.replaceAll("\\$\\{webapp\\.root\\}", path.getParentFile().getAbsolutePath());
            content = content.replaceAll("\\$\\{webapp\\.name\\}", path.getParentFile().getName());
            
            File outfile = new File(logconfig.getParentFile(),"log4j.properties");
            if (outfile.exists())
            {
                outfile.delete();
            }
            FileOutputStream out = new FileOutputStream(outfile);
            Util.copy(new ByteArrayInputStream(content.getBytes()), out);
            out.flush();
            out.close();
        }
        catch (Exception ex)
        {
            throw new RuntimeException(ex);
        }
    }
}
