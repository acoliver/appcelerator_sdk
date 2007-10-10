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
package org.appcelerator.servlet.upload;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.FutureTask;

import javax.security.auth.Subject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.appcelerator.Constants;
import org.appcelerator.annotation.InjectBean;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.IServiceBroker;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataType;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.servlet.dispatcher.DispatchServlet;
import org.appcelerator.util.TimeUtil;
import org.springframework.beans.factory.ListableBeanFactory;


/**
 * UploadServlet is a servlet that accepts file upload from front-end
 * and convert the upload into a appcelerator message internally.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class UploadServlet extends DispatchServlet
{
    private static final long serialVersionUID = 1L;
    
    private boolean authenticationRequired = true;
    private ListableBeanFactory factory;
    @InjectBean
    private IServiceBroker serviceBroker;
    private DiskFileItemFactory fileFactory = new DiskFileItemFactory();
    private File tempDirectory;
    private int maxFileSize = Integer.MAX_VALUE;
    
    
    public int getMaxFileSize()
    {
        return maxFileSize;
    }

    public void setMaxFileSize(int maxFileSize)
    {
        this.maxFileSize = maxFileSize;
    }

    public File getTempDirectory()
    {
        return tempDirectory;
    }

    public void setTempDirectory(File tempDirectory)
    {
        this.tempDirectory = tempDirectory;
    }

    public boolean isAuthenticationRequired()
    {
        return authenticationRequired;
    }

    public void setAuthenticationRequired(boolean authenticationRequired)
    {
        this.authenticationRequired = authenticationRequired;
    }
    
    @Override
    public void init(ServletConfig config) throws ServletException
    {
        super.init(config);
        this.factory = (ListableBeanFactory) config.getServletContext().getAttribute(Constants.BEAN_FACTORY);
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        if (request.getMethod().equalsIgnoreCase("POST"))
        {
            Subject user = (Subject)request.getSession().getAttribute(Constants.USER);
            
            // potential security check, make sure we're logged in and have a user in the session
            if (isAuthenticationRequired())
            {
                if (null == user)
                {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN);
                    return;
                }
            }

            // paranoia check -we don't accept urlencoded transfers which are very bad performance wise
            if (false == ServletFileUpload.isMultipartContent(request))
            {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST,"must be 'multipart/form-data'");
                return;
            }
            
            if (serviceBroker==null)
            {
                serviceBroker = (IServiceBroker)factory.getBean("serviceBroker",IServiceBroker.class);
             
                if (tempDirectory!=null)
                {
                    fileFactory.setRepository(tempDirectory);
                }
                fileFactory.setSizeThreshold(maxFileSize);
            }
            
            String type = null;
            String callback = null;
            long size = 0L;
            String instanceid = null;
            IMessageDataObject data = MessageUtils.createMessageDataObject();
            
            try
            {
                ServletFileUpload upload = new ServletFileUpload(fileFactory);
                List items = upload.parseRequest(request);
                for (Iterator i = items.iterator(); i.hasNext();)
                {
                    FileItem item = (FileItem)i.next();
                    if (item.isFormField())
                    {
                        if (item.getFieldName().equals("callback"))
                        {
                            callback = item.getString();
                            continue;
                        }
                        else if (item.getFieldName().equals("type"))
                        {
                            type = item.getString();
                            continue;
                        }
                        else if (item.getFieldName().equals("instanceid"))
                        {
                            instanceid = item.getString();
                            continue;
                        }
                        // place it in the data payload
                        data.put(item.getFieldName(), item.getString());
                    }
                    else
                    {
                        File f = null;
                        if (tempDirectory!=null)
                        {
                            f = File.createTempFile("sup", ".tmp", tempDirectory);
                        }
                        else
                        {
                            f = File.createTempFile("sup", ".tmp");
                        }
                        
                        f.deleteOnExit();

                        // write out the temporary file
                        item.write(f);
                        
                        size = item.getSize();
                        
                        IMessageDataObject filedata = MessageUtils.createMessageDataObject();
                        
                        filedata.put("file", f.getAbsolutePath());
                        filedata.put("size", size);
                        filedata.put("contentType", item.getContentType());
                        filedata.put("fieldName", item.getFieldName());
                        filedata.put("fileName",item.getName());
                        
                        data.put("filedata",filedata);
                    }
                }

                // required parameter type
                if (type == null || type.equals(""))
                {
                    response.sendError(HttpServletResponse.SC_BAD_REQUEST,"missing 'type' parameter");
                    return;
                }
            }
            catch (Throwable fe)
            {
                fe.printStackTrace();
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,fe.getMessage());
                return;
            }
            
            String scope = request.getParameter("scope");
            String version = request.getParameter("version");
            
            if (scope==null)
            {
                scope = "appcelerator";
            }
            if (version==null)
            {
                version = "1.0";
            }
            
            // create a message
            Message msg = new Message();
            msg.setUser((Subject)request.getSession().getAttribute(Constants.USER));
            msg.setDataType(MessageDataType.JSON);
            msg.setDirection(MessageDirection.INCOMING);
            msg.setSession(request.getSession());
            msg.setSessionid(request.getSession().getId());
            msg.setType(type);
            msg.setUser(user);
            msg.setData(data);
            msg.setAddress(InetAddress.getByName(request.getRemoteAddr()));
            msg.setInstanceid(instanceid);
            msg.setScope(scope);
            msg.setVersion(version);
            
            // send the data
            FutureTask<Void> future = new FutureTask<Void>(new Runnable(){public void run(){}},null);
            serviceBroker.dispatch(msg,future);
            try
            {
                // wait for upload to finish processing
                future.get();
            }
            catch (Exception ignore)
            {
            }
            
            response.setHeader("Pragma","no-cache");
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, private");
            response.setDateHeader("Expires", System.currentTimeMillis()-TimeUtil.ONE_YEAR);
            response.setContentType("text/html");
            
            // optionally, invoke a callback function/message on upload in the client
            if (callback!=null)
            {
                StringBuilder code = new StringBuilder();
                code.append("<html><head><script>");
                
                if (callback.startsWith("l:") || callback.startsWith("local:") || callback.startsWith("r:") || callback.startsWith("remote:"))
                {
                    // a appcelerator message to fires
                    code.append("window.parent.$MQ(");
                    code.append("'");
                    code.append(callback);
                    code.append("', {size:").append(size).append("}");
                    code.append(",'"+scope+"','"+version+"');");
                }
                else
                {
                    // a javascript function to call
                    code.append("window.parent.").append(callback).append("();");
                }
                code.append("</script></head><body></body></html>");
                
                // send the response
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().print(code.toString());
            }
            else
            {
                response.setStatus(HttpServletResponse.SC_ACCEPTED);
            }
        }
        else
        {
            response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED,"method was: "+request.getMethod());
        }
    }    
}
