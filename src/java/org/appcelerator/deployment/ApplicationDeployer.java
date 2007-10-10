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
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.regex.Pattern;

import javax.security.auth.Subject;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.appcelerator.Constants;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.Message;
import org.appcelerator.router.ServiceConstants;
import org.appcelerator.security.IApplicationAuthorizer;
import org.appcelerator.util.Util;
import org.springframework.web.context.ServletContextAware;

public class ApplicationDeployer implements ServletContextAware, IDeployer
{
    private static final Logger LOG = Logger.getLogger(ApplicationDeployer.class);
    public static final Pattern RELEASE_REGEX = Pattern.compile("current|latest|[0-9]+");
    private File releaseDirectory;
    private Map<String,Integer> RELEASES = new HashMap<String,Integer>();
    private Map<String,SortedSet<Integer>> APP_RELEASES = new HashMap<String,SortedSet<Integer>>();
    private Properties properties = new Properties();
    private boolean autoActivate;
    
    @Service(request=ServiceConstants.SERVICE_PREFIX+"applications.query.request",response=ServiceConstants.SERVICE_PREFIX+"applications.query.response", authenticationRequired=false)
    protected void queryApplications (Message request, Message response) throws Exception
    {
        //TODO: finish
        response.getData().put("success", true);
    }
    
    private void saveReleaseInfo ()
    {
        File file = new File(releaseDirectory,"release.properties");
        FileOutputStream out = null;
        try
        {
            out = new FileOutputStream(file);
            properties.store(out, "PLEASE DO NOT MODIFY THIS FILE");
        }
        catch (Exception ex)
        {
            LOG.error("error saving "+file,ex);
        }
        finally
        {
            if (out!=null)
            {
                try
                {
                    out.close();
                }
                catch (Exception ignore)
                {
                }
            }
        }
    }
    
    private final Comparator<Integer> RELEASE_COMPARATOR = new Comparator<Integer>()
    {
        public int compare(Integer o1, Integer o2)
        {
            if (o1 < o2)
            {
                return -1;
            }
            else if (o1 == o2)
            {
                return 0;
            }
            return 1;
        }
    };
    
    public Integer getCurrentVersion (String appname)
    {
        Integer current = RELEASES.get(appname);
        if (current != null)
        {
            return current;
        }
        return 0;
    }
    
    public Integer getLastVersion (String appname)
    {
        SortedSet<Integer> releases = APP_RELEASES.get(appname);
        if (releases != null)
        {
            return releases.last();
        }
        return 0;
    }
    
    private final Map<String,IApplicationAuthorizer> authorizers = new HashMap<String,IApplicationAuthorizer>();
    
    
    public boolean getAuthorization (HttpSession session, String app, String version, String path)
    {
        Subject user = (Subject)session.getAttribute(Constants.USER);
        
        String providerName = properties.getProperty(app+"."+version+".authorization.provider");
        
        if (providerName == null)
        {
            providerName = properties.getProperty(app+".*.authorization.provider");
            if (providerName == null)
            {
                providerName = properties.getProperty("*.authorization.provider");
            }
        }
        
        // attempt to get the registered provider
        IApplicationAuthorizer authorizer = authorizers.get(providerName);
        if (authorizer!=null)
        {
            // get the configured context
            String context = properties.getProperty(app+"."+version+".authorization.context");
            if (context==null)
            {
                context = properties.getProperty(app+".*.authorization.context");
                if (context==null)
                {
                    context = properties.getProperty("*.authorization.context");
                }
            }
            return authorizer.authorize(session, app, version, path, context, user);
        }
        
        return true;
    }
    
    public void setServletContext(ServletContext context)
    {
        releaseDirectory = new File(context.getRealPath("/WEB-INF/apps/releases/"));
        releaseDirectory.mkdirs();
        
        LOG.info("application releaseDirectory => "+releaseDirectory);

        InputStream in = null;
        try
        {
            File file = new File(releaseDirectory,"release.properties");
            if (file.exists())
            {
                in = new FileInputStream(file);
                properties.load(in);
            }
            
            String aa = properties.getProperty("autoactivate");
            if (aa==null)
            {
                aa = "true";
                properties.setProperty("autoactivate", "true");
            }
            autoActivate = Boolean.valueOf(aa);
        }
        catch (Exception ex)
        {
            LOG.error("Error loading release.properties from "+releaseDirectory,ex);
        }
        finally
        {
            if (in!=null) 
            {
                try
                {
                    in.close();
                }
                catch (Exception ignore)
                {
                    
                }
            }
        }
        
        for (File dir : releaseDirectory.listFiles())
        {
            if (dir.isDirectory())
            {
                String appname = dir.getName();
                SortedSet<Integer> releases = APP_RELEASES.get(appname);
                if (releases == null)
                {
                    releases = new TreeSet<Integer>(RELEASE_COMPARATOR);
                    APP_RELEASES.put(appname, releases);
                }
                
                String current = properties.getProperty(appname);
                
                for (File reldir : dir.listFiles())
                {
                    if (reldir.isDirectory())
                    {
                        String rel = reldir.getName();
                        if (RELEASE_REGEX.matcher(rel).matches())
                        {
                            releases.add(Integer.parseInt(rel));
                            LOG.info("loading "+appname+", release: "+rel);
                        }
                    }
                }
                
                if (current == null && !releases.isEmpty())
                {
                    current = releases.last().toString();
                    properties.put(appname, current);
                }
                
                if (current==null)
                {
                    // no active releases, remove it
                    releases.remove(appname);
                }
                else
                {
                    // put in the active release
                    RELEASES.put(appname, Integer.parseInt(current));
                }
            }
        }
        
        // update release info
        saveReleaseInfo();
    }

    public void deploy (File matches[])
    {
        for (File file : matches)
        {
            String filename = file.getName();
            int idx = filename.indexOf("-app.jar");
            if (idx > 0)
            {
                String appname = filename.substring(0,idx);
                // always get the last, not necessarily the current since we may rollback version
                Integer current = getLastVersion(appname);
                int newVersion = current+1;
                // create the new release directory
                File newReleaseDir = new File(releaseDirectory,appname+"/"+newVersion);
                LOG.info("detected new application named: "+appname+", version: "+newVersion);
                newReleaseDir.mkdirs();
                try
                {
                    Util.extractJAR(file, newReleaseDir);
                    
                    // delete the file from the stage
                    file.delete();
                    
                    // add the new release
                    SortedSet<Integer> releases = APP_RELEASES.get(appname);
                    if (releases==null)
                    {
                        releases = new TreeSet<Integer>(RELEASE_COMPARATOR);
                        APP_RELEASES.put(appname, releases);
                    }
                    releases.add(newVersion);
                    if (autoActivate)
                    {
                        RELEASES.put(appname, newVersion);
                    }
                }
                catch (Exception ex)
                {
                    LOG.error("error deploying "+file,ex);
                }
            }
        }
    }

    public FileFilter getFilter()
    {
        return new FileFilter()
        {
            public boolean accept(File pathname)
            {
                return pathname.isFile() && pathname.getName().endsWith("-app.jar");
            }
        };
    }

}
