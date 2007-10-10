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
package org.appcelerator.deployment;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.util.Util;

/**
 * composite deployer will extract any jars that aren't services or apps into the 
 * deployment directory
 * 
 * @author jhaynie
 */
public class CompositeDeployer implements IDeployer
{
    private static final Logger LOG = Logger.getLogger(CompositeDeployer.class);
    
    @InjectBean
    private DeploymentManager deploymentManager;
    
    public void deploy(File[] matches)
    {
        for (File file : matches)
        {
            try
            {
                Util.extractJAR(file, deploymentManager.getDeployDirectory());
            }
            catch (IOException e)
            {
                LOG.error("Error deploying composite JAR: "+file,e);
            }
            finally
            {
                file.delete();
            }
        }
    }

    public FileFilter getFilter()
    {
        return new FileFilter()
        {
            public boolean accept(File pathname)
            {
                return pathname.isFile() && 
                    pathname.getName().endsWith(".aar");
            }
        };
    }
}
