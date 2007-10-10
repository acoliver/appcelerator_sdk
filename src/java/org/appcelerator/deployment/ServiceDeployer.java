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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;

import org.apache.log4j.Logger;
import org.appcelerator.annotation.LifecycleDestructionAware;
import org.appcelerator.annotation.LifecycleInitializationAware;
import org.appcelerator.annotation.Service;
import org.appcelerator.messaging.IMessageDataList;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.router.ServiceConstants;
import org.appcelerator.service.ServiceBundle;
import org.appcelerator.spring.SpringUtil;
import org.appcelerator.util.Util;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanClassLoaderAware;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.xml.XmlBeanDefinitionReader;
import org.springframework.web.context.ServletContextAware;
import org.xml.sax.InputSource;

/**
 * ServiceDeployer class is responsible for deploying services and managing de-activation and re-activation
 * 
 * @author jhaynie
 */
public class ServiceDeployer implements BeanClassLoaderAware, BeanFactoryAware, ServletContextAware, IDeployer
{
    private static final Logger LOG = Logger.getLogger(ServiceDeployer.class);
    private static final Pattern RELEASE_REGEX = Pattern.compile("[0-9]+");
    
    private ClassLoader parentClassLoader;
    private BeanFactory parentFactory;
    private Properties appProperties;
    private Properties properties=new Properties();
    private File servicesDir;
    private Map<String,SortedSet<ServiceBundle>> serviceBundles = new HashMap<String,SortedSet<ServiceBundle>>();
    private Map<String,ServiceBundle> releaseBundles = new HashMap<String,ServiceBundle>();

    private final Comparator<ServiceBundle> RELEASE_COMPARATOR = new Comparator<ServiceBundle>()
    {
        public int compare(ServiceBundle o1, ServiceBundle o2)
        {
            if (o1.getRelease() < o2.getRelease())
            {
                return -1;
            }
            else if (o1.getRelease() == o2.getRelease())
            {
                return 0;
            }
            return 1;
        }
    };

    public int getCurrentRelease (String bundleName)
    {
        ServiceBundle release = releaseBundles.get(bundleName);
        if (release!=null)
        {
            return release.getRelease();
        }
        return 0;
    }

    public int getLatestRelease (String bundleName)
    {
        SortedSet<ServiceBundle> releases = serviceBundles.get(bundleName);
        if (releases!=null && !releases.isEmpty())
        {
            return releases.last().getRelease();
        }
        return 0;
    }
    
    private void saveReleaseInfo ()
    {
        File file = new File(servicesDir,"release.properties");
        FileOutputStream out = null;
        try
        {
            for (ServiceBundle bundle : releaseBundles.values())
            {
                properties.setProperty(bundle.getName()+".current", String.valueOf(bundle.getRelease()));
            }
            
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

    private ServiceBundle createBundle(File dir, String bundleName, int newRelease) throws Exception
    {
        List<URL> urls = new ArrayList<URL>();
        urls.add(dir.toURL());
        File files [] = dir.listFiles(new FileFilter()
        {
            public boolean accept(File pathname)
            {
                return pathname.isFile() && pathname.getName().endsWith(".jar");
            }
        });
        if (files!=null && files.length>0)
        {
            for (File f : files)
            {
                urls.add(f.toURL());
            }
        }
        URLClassLoader cl = URLClassLoader.newInstance(urls.toArray(new URL[urls.size()]),parentClassLoader);
        
        ClassLoader currentCL = Thread.currentThread().getContextClassLoader();
        try
        {
            Thread.currentThread().setContextClassLoader(cl);

            InputStream in = new FileInputStream(new File(dir,"appcelerator-services.xml"));
            
            DefaultListableBeanFactory serviceFactory = new DefaultListableBeanFactory();
            serviceFactory.setAllowBeanDefinitionOverriding(true);
            serviceFactory.setParentBeanFactory(parentFactory);
            
            XmlBeanDefinitionReader serviceFactoryReader=new XmlBeanDefinitionReader(serviceFactory);
            serviceFactoryReader.setValidationMode(XmlBeanDefinitionReader.VALIDATION_NONE);
            serviceFactoryReader.setBeanClassLoader(cl);
            serviceFactoryReader.loadBeanDefinitions(new InputSource(in));
            
            return new ServiceBundle(bundleName,newRelease,serviceFactory);
        }
        finally
        {
            Thread.currentThread().setContextClassLoader(currentCL);
        }
    }
    
    public void setBeanClassLoader(ClassLoader cl)
    {
        this.parentClassLoader = cl;
    }

    public void setBeanFactory(BeanFactory f) throws BeansException
    {
        this.parentFactory = f;
    }
    
    @LifecycleInitializationAware
    public void start () throws Exception
    {
        File pfile = new File(servicesDir,"release.properties");
        if (!pfile.exists())
        {
            properties.put("autoactivate", "true");
            saveReleaseInfo();
        }
        else
        {
            FileInputStream in = new FileInputStream(pfile);
            properties.load(in);
            in.close();
            

            File serviceDirs[] = servicesDir.listFiles(new FileFilter()
            {
                public boolean accept(File pathname)
                {
                    return pathname.isDirectory();
                }
            });
            
            for (File serviceDir : serviceDirs)
            {
                File versions[] = serviceDir.listFiles(new FileFilter()
                {
                    public boolean accept(File pathname)
                    {
                        return pathname.isDirectory() && RELEASE_REGEX.matcher(pathname.getName()).matches();
                    }
                });
                
                int current = Integer.parseInt(properties.getProperty(serviceDir.getName()+".current","0"));
                
                SortedSet<ServiceBundle> releases=new TreeSet<ServiceBundle>(RELEASE_COMPARATOR);
                serviceBundles.put(serviceDir.getName(), releases);
                
                for (File versionDir : versions)
                {
                    int version = Integer.parseInt(versionDir.getName());
                    ServiceBundle bundle = createBundle(versionDir, serviceDir.getName(), version);
                    releases.add(bundle);
                    if (version == current)
                    {
                        releaseBundles.put(serviceDir.getName(),bundle);
                        LOG.info("loading existing service bundle "+bundle.getName()+", release: "+bundle.getRelease());
                        bundle.activate();
                    }
                }
            }
        }
    }
    
    public void setServletContext(ServletContext ctx)
    {
        this.appProperties = (Properties)ctx.getAttribute("appcelerator.properties");
        
        String root = appProperties.getProperty("webapp.root");
        File fileRoot = new File(root);
        servicesDir = new File(fileRoot,"WEB-INF/services");
        if (!servicesDir.exists())
        {
            servicesDir.mkdirs();   
        }
    }

    /**
     * called when the main bean factory is destroyed
     */
    @LifecycleDestructionAware
    public void destroy() throws Exception
    {
        for (ServiceBundle bundle : releaseBundles.values())
        {
            LOG.info("deactivating service bundle: "+bundle.getName()+", release: "+bundle.getRelease());
            bundle.deactivate();
        }
        releaseBundles.clear();
        serviceBundles.clear();
    }

    @Service(request=ServiceConstants.SERVICE_PREFIX+"servicebundle.query.request", response=ServiceConstants.SERVICE_PREFIX+"servicebundle.query.response", authenticationRequired=false)
    protected void getServiceBundles (Message request, Message response)
    {
        IMessageDataList<IMessageDataObject> services = MessageUtils.createMessageDataObjectList();
        
        for (String name : serviceBundles.keySet())
        {
            IMessageDataObject obj = MessageUtils.createMessageDataObject();
            IMessageDataList<IMessageDataObject> list = MessageUtils.createMessageDataObjectList();
            
            int release = 0;
            for (ServiceBundle bundle : serviceBundles.get(name))
            {
                IMessageDataObject b = MessageUtils.createMessageDataObject();
                b.put("release", bundle.getRelease());
                b.put("activated", bundle.isActivated());
                list.add(b);
                if (bundle.isActivated())
                {
                    release = bundle.getRelease();
                }
            }
            
            obj.put("name", name);
            obj.put("releases",list);
            obj.put("active",release);
            obj.put("activated",release>0);
            obj.put("status",release>0 ? "Active" : "Inactive");
            services.add(obj);
        }
        
        response.getData().put("services", services);
        response.getData().put("count",services.size());
        response.getData().put("success", true);
    }
    
    @Service(request=ServiceConstants.SERVICE_PREFIX+"servicebundle.activate.request", response=ServiceConstants.SERVICE_PREFIX+"servicebundle.activate.response", authenticationRequired=false)
    protected void activateServiceBundle (Message request, Message response) throws Exception
    {
        SortedSet<ServiceBundle> bundles = serviceBundles.get(request.getData().getString("name"));
        if (null == bundles)
        {
            response.getData().put("success",false);
            response.getData().put("message", "Invalid service name");
        }
        else
        {
            boolean found = false;
            int release = request.getData().getInt("release");
            for (ServiceBundle b : bundles)
            {
                if (b.getRelease()==release)
                {
                    releaseBundles.put(b.getName(), b);
                    b.activate();
                    found = true;
                    break;
                }
            }
            if (found)
            {
                response.getData().put("name",request.getData().getString("name"));
                response.getData().put("success", true);
            }
            else
            {
                response.getData().put("success", false);
                response.getData().put("message", "Invalid release");
            }
        }
    }
    
    @Service(request=ServiceConstants.SERVICE_PREFIX+"servicebundle.deactivate.request", response=ServiceConstants.SERVICE_PREFIX+"servicebundle.deactivate.response", authenticationRequired=false)
    protected void deactivateServiceBundle (Message request, Message response) throws Exception
    {
        ServiceBundle bundle = releaseBundles.remove(request.getData().getString("name"));
        if (null == bundle)
        {
            response.getData().put("success",false);
            response.getData().put("message", "Invalid service name");
        }
        else
        {
            bundle.deactivate();
            response.getData().put("name",bundle.getName());
            response.getData().put("success", true);
        }
    }

    public void deploy(File[] matches)
    {
        boolean commit = false;
        
        for (File file : matches)
        {
           try
           {
               int idx = file.getName().indexOf("-services.jar");
               String bundleName = file.getName().substring(0,idx);
               int newRelease = getLatestRelease(bundleName) + 1;

               LOG.info("found new bundle: "+bundleName+", release target: "+newRelease);
               
               File serviceDir = new File(servicesDir,bundleName+"/"+newRelease);
               
               Util.extractJAR(file, serviceDir);
               
               // each jar must have one of these files
               File serviceFile = new File(serviceDir,"appcelerator-services.xml");
               if (!serviceFile.exists())
               {
                   LOG.error("invalid service bundle, no appcelerator-services.xml file found in "+file);
                   continue;
               }
               
               // do magic on the spring file with our application properties
               String newSpringOut = SpringUtil.replaceProperties(new FileInputStream(serviceFile), appProperties);
               Util.copy(new ByteArrayInputStream(newSpringOut.getBytes()), new FileOutputStream(serviceFile));
               
               ServiceBundle bundle = createBundle(serviceDir,bundleName,newRelease);

               SortedSet<ServiceBundle> releases = serviceBundles.get(bundleName);
               if (releases==null)
               {
                   releases = new TreeSet<ServiceBundle>(RELEASE_COMPARATOR);
                   serviceBundles.put(bundleName, releases);
               }
               
               // add the bundle
               releases.add(bundle);

               // activate new bundle potentially
               boolean activate = Boolean.valueOf(properties.getProperty("autoactivate","true"));
               if (activate)
               {
                   ServiceBundle current = releaseBundles.remove(bundleName);
                   if (current!=null)
                   {
                       LOG.info("unloading existing bundle on auto-activate of "+bundleName);
                       current.deactivate();
                   }
                   releaseBundles.put(bundleName, bundle);
                   LOG.info("activating bundle on auto-activate of "+bundleName+", release: "+bundle.getRelease()+", count: "+bundle.getFactory().getSingletonCount());
                   bundle.activate();
               }
           }
           catch (Exception ex)
           {
               LOG.error("Error attempting to deploy = "+file,ex);
           }
           finally
           {
               file.delete();
               commit = true;
           }
        }
        if (commit)
        {
            saveReleaseInfo();
        }
    }

    public FileFilter getFilter()
    {
        return new FileFilter()
        {
            public boolean accept(File pathname)
            {
                return pathname.isFile() && pathname.getName().endsWith("-services.jar");
            }
        };
    }
}
