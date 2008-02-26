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
package org.appcelerator.update;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.LifecycleDestructionAware;
import org.appcelerator.annotation.LifecycleInitializationAware;
import org.appcelerator.threading.GlobalTask;
import org.appcelerator.threading.GlobalTimer;
import org.appcelerator.util.HttpUtil;
import org.appcelerator.util.TimeUtil;
import org.appcelerator.util.Util;
import org.appcelerator.util.HttpUtil.FetchedUrlConnection;

/**
 * Update check service.  Will basically check the public update site for
 * Appcelerator and attempt to determine if the version you have has been
 * updated since you installed the version you're running.
 */
public class UpdateService
{
    private static final Logger LOG = Logger.getLogger(UpdateService.class);
    private GlobalTask task;
    
    @LifecycleInitializationAware
    public void start ()
    {
        final Properties p = new Properties();
        final File file = new File("appcelerator-version.properties");
        try
        {
            if (file.exists())
            {
                InputStream in = new FileInputStream(file);
                p.load(in);
                in.close();
            }
            else
            {
                p.setProperty("version", "${VERSION}");
                p.setProperty("site","http://updatesite.appcelerator.org");
                p.setProperty("last",String.valueOf(System.currentTimeMillis()-TimeUtil.ONE_YEAR));
            }
             
            String last = p.getProperty("last");
            long lastTime = last==null ? System.currentTimeMillis()-TimeUtil.ONE_YEAR : Long.valueOf(last);
            
            long delay = System.currentTimeMillis() - lastTime;
            // now run the timer and have it fire once per week
            task = new GlobalTask()
            {
                public void run ()
                {
                    // we need to check again
                    check(file,p);
                }
            };
            GlobalTimer.get().scheduleAtFixedRate(task, delay >= TimeUtil.ONE_DAY ? 10 : TimeUtil.ONE_DAY*7, TimeUtil.ONE_DAY*7, TimeUnit.MILLISECONDS);
        }
        catch (Throwable te)
        {
            // ignore errors - updates can't stop the server from running
        }
    }
    
    private void check (File file, Properties properties)
    {
        try
        {
            String site = properties.getProperty("site");
            String version = properties.getProperty("version");
            String systemid = properties.getProperty("systemid");
            
            String url = site + "?pkg=sdk_java&systemid="+Util.notNull(systemid, "")+"&version="+version;
            
            FetchedUrlConnection conn = HttpUtil.fetch(new URL(url));
            String response = conn.getOutput();
            
            int idx = response.indexOf("<version ");
            if (idx > 0)
            {
                String line = response.substring(idx+("<version ".length()));
                idx = line.lastIndexOf("></version>");
                line = line.substring(0,idx);
                line = line.replace("'","");
                String tokens[]=line.split(" ");

                HashMap<String,String> config=new HashMap<String,String>();
                for (String token : tokens)
                {
                    String split[] = token.split("=");
                    if (split.length==2)
                    {
                        config.put(split[0], split[1]);
                    }
                }
                
                String current = config.get("current");
                if (current!=null && !Boolean.valueOf(current).booleanValue())
                {
                    LOG.info("A new version of Appcelerator is available: "+config.get("version")+", released on: "+config.get("date"));
                }
                
                if (systemid==null)
                {
                    // set our system id if not initially configured
                    properties.setProperty("systemid", config.get("systemid"));
                }
            }
        }
        catch (Exception ig)
        {
            // ignore
            LOG.debug("exception attempting to check for updates --- this message is informative only and can be safely ignored",ig);
        }

        try
        {
            // update last check timestamp
            properties.setProperty("last", String.valueOf(System.currentTimeMillis()));
            
            FileOutputStream fos = new FileOutputStream(file);
            properties.store(fos, "update on "+new Date());
            fos.flush();
            fos.close();
        }
        catch (Exception x)
        {
            // ignore
        }
    }
    
    
    @LifecycleDestructionAware
    public void stop ()
    {
        try
        {
            if (task!=null)
            {
                task.cancel();
                task = null;
            }
        }
        catch (Exception ignore)
        {
        }
    }
}
