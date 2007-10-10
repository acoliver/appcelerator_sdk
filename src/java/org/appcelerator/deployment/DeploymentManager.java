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
import java.util.List;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletContext;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.LifecycleDestructionAware;
import org.appcelerator.annotation.LifecycleInitializationAware;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.router.ServiceConstants;
import org.appcelerator.threading.GlobalTask;
import org.appcelerator.threading.GlobalTimer;
import org.appcelerator.util.Util;
import org.springframework.web.context.ServletContextAware;

/**
 * main deployment manager that delegates actual work of deployment to IDeployer
 * implementations
 *
 */
public class DeploymentManager implements ServletContextAware
{
    private static final Logger LOG = Logger.getLogger(DeploymentManager.class);
    
    private Task task;
    private int period = 2;
    private List<IDeployer> deployers;
    private File deployDirectory;
    
    public void setScanPeriod (int period)
    {
        this.period = period;
    }
    
    public void setDeployers (List<IDeployer> d)
    {
        this.deployers = d;
    }
    
    private final class Task extends GlobalTask
    {
        @Override
        public void run()
        {
            scanDirectory();
        }
    }

    private void scanDirectory()
    {
        for (IDeployer deployer : deployers)
        {
            FileFilter filter = deployer.getFilter();
            File matches [] = deployDirectory.listFiles(filter);
            if (matches!=null && matches.length > 0)
            {
                deployer.deploy(matches);
            }
        }
    }
    
    @LifecycleInitializationAware
    public void init ()
    {
        task = new Task();
        
        // start the timer
        GlobalTimer.get().scheduleWithFixedDelay(task, 0, period, TimeUnit.SECONDS);
    }
    
    @LifecycleDestructionAware
    public void destroy ()
    {
        task.cancel();
        task = null;
    }

    public void setServletContext(ServletContext context)
    {
        deployDirectory = new File(context.getRealPath("/WEB-INF/deploy/"));
        LOG.info("deployment directory = "+deployDirectory.getAbsolutePath());
        deployDirectory.mkdirs();
    }

    public File getDeployDirectory()
    {
        return deployDirectory;
    }

    public void setDeployDirectory(File deployDirectory)
    {
        this.deployDirectory = deployDirectory;
    }
    
    @Service(request=ServiceConstants.SERVICE_PREFIX+"deployer.deploy.request",response=ServiceConstants.SERVICE_PREFIX+"deployer.deploy.response", authenticationRequired=false)
    protected void deployComposite (Message request, Message response) throws Exception
    {
        IMessageDataObject filedata = request.getData().getObject("filedata");
        String file = filedata.getString("file");
        String filename = filedata.getString("fileName");
        File f = new File(file);
        File tdf = new File(deployDirectory,filename+".tmp");
        File df = new File(deployDirectory,filename);
        Util.copyFile(f,tdf);
        tdf.renameTo(df);
        response.getData().put("success", true);
    }

}
