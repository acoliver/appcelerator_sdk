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
package org.appcelerator.transport;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;
import java.security.Principal;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageDataType;
import org.appcelerator.messaging.MessageDirection;
import org.appcelerator.messaging.MessageUtils;
import org.appcelerator.dispatcher.ServiceDispatcherManager;
import org.appcelerator.util.TimeUtil;


/**
 * UploadServlet is a servlet that accepts file upload from front-end
 * and convert the upload into a appcelerator message internally.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class UploadTransportServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;
    private static final Log LOG = LogFactory.getLog(UploadTransportServlet.class);
    
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

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        if (request.getMethod().equalsIgnoreCase("POST"))
        {
            // paranoia check -we don't accept urlencoded transfers which are very bad performance wise
            if (false == ServletFileUpload.isMultipartContent(request))
            {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST,"must be 'multipart/form-data'");
                return;
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
            msg.setUser(request.getUserPrincipal());
            msg.setDataType(MessageDataType.JSON);
            msg.setDirection(MessageDirection.INCOMING);
            msg.setSession(request.getSession());
            msg.setSessionid(request.getSession().getId());
            msg.setType(type);
            msg.setData(data);
            msg.setAddress(InetAddress.getByName(request.getRemoteAddr()));
            msg.setInstanceid(instanceid);
            msg.setScope(scope);
            msg.setVersion(version);
            
            // send the data
            ArrayList<Message> responses=new ArrayList<Message>();
			try
			{
	            ServiceDispatcherManager.dispatch(msg,responses);
			}
			catch (Exception ex)
			{
				LOG.error("error dispatching upload message: "+msg,ex);
	            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				return;
			}
            
            response.setHeader("Pragma","no-cache");
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, private");
            response.setDateHeader("Expires", System.currentTimeMillis()-TimeUtil.ONE_YEAR);
            response.setContentType("text/html");
            
            // optionally, invoke a callback function/message on upload in the client
            if (callback!=null || !responses.isEmpty())
            {
                StringBuilder code = new StringBuilder();
                code.append("<html><head><script>");

				if (callback!=null)
				{
	                if (callback.startsWith("l:") || callback.startsWith("local:") || callback.startsWith("r:") || callback.startsWith("remote:"))
					{
		                code.append(makeMessage(callback,"{size:" + size + "}", scope, version));
					}
					else
					{
		                // a javascript function to call
		                code.append("window.parent.").append(callback).append("();");
					}
				}

				for (Message m : responses)
				{
					code.append(makeMessage(m.getType(),m.getData().toDataString(),m.getScope(),m.getVersion()));
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

	private String makeMessage(String type, String data, String scope, String version)
	{
		StringBuilder code = new StringBuilder();
        code.append("window.parent.$MQ(");
        code.append("'");
        if (!type.startsWith("l:") && !type.startsWith("local:") && 
			!type.startsWith("r:") && !type.startsWith("remote:"))
		{
			code.append("r:");
		}
        code.append(type);
        code.append("', ").append(data);
        code.append(",'").append(scope).append("','").append(version).append("');\n");
		return code.toString();
	}
}
