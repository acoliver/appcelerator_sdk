/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
package org.appcelerator.transport;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

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
import org.appcelerator.annotation.AnnotationHelper;
import org.appcelerator.locator.ServiceLocatorManager;
import org.appcelerator.messaging.IMessageDataObject;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;
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

    private boolean embeddedMode;

    /* (non-Javadoc)
     * @see javax.servlet.GenericServlet#init(javax.servlet.ServletConfig)
     */
    @Override
    public void init(ServletConfig config) throws ServletException
    {
        super.init(config);

        if (this.embeddedMode)
        {
            AnnotationHelper.initializeAnnotationDBFromClasspath();
        }
        else
        {
            AnnotationHelper.initializeAnnotationDBFromServlet(config.getServletContext());
        }
        ServiceLocatorManager.intialize(config.getServletContext());
    }

    /**
     * called to indicate that the class path must be used when loading annotations instead
     * of WAR lib
     */
    public void setEmbeddedMode(boolean embed)
    {
        this.embeddedMode = embed;
    }

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
    @SuppressWarnings("unchecked")
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
            // String instanceid = null;
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
                            //instanceid = item.getString();
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
            msg.setSession(request.getSession());
            msg.setServletRequest(request);
            msg.setType(type);
            msg.setData(data);
            msg.setAddress(InetAddress.getByName(request.getRemoteAddr()));
            msg.setScope(scope);
            msg.setVersion(version);

            // send the data
            ArrayList<Message> responses=new ArrayList<Message>();
			try
			{
	            ServiceLocatorManager.dispatch(msg,responses);
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
            response.setContentType("text/html;charset=UTF-8");

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
