package org.appcelerator.util;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;


public class DownloadHelper {
    public static final String BINARY = "application/octet-stream";
    public static final String HTML = "text/html";
    public static final String TEXT = "text/plain";
    public static final String MS_EXCEL = "application/vnd.ms-excel";
    public static final String CSV = "text/csv";
    public static final String IMAGE_JPEG = "image/jpeg";
    public static final String IMAGE_PNG = "image/png";
    public static final String IMAGE_GIF = "image/gif";
    public static final String ZIP = "application/x-zip-compressed";

    public enum Type
    {
        INLINE,
        ATTACHMENT
    }
    
    private String contentType = BINARY;
    private Type type = Type.ATTACHMENT;
    private int statusCode = HttpServletResponse.SC_OK;
    private String filename = UUID.randomUUID().toString();
    private Map<String,String> headers = new HashMap<String,String>();
    
    public DownloadHelper(String contentType, String filename)
    {
        this.contentType = contentType;
        this.filename = filename;
    }
    
    public String getContentType()
    {
        return contentType;
    }
    public void setContentType(String contentType)
    {
        this.contentType = contentType;
    }
    public String getFilename()
    {
        return filename;
    }
    public void setFilename(String filename)
    {
        this.filename = filename;
    }
    public Map<String, String> getHeaders()
    {
        return headers;
    }
    public void setHeaders(Map<String, String> headers)
    {
        this.headers = headers;
    }
    public int getStatusCode()
    {
        return statusCode;
    }
    public void setStatusCode(int statusCode)
    {
        this.statusCode = statusCode;
    }
    public Type getType()
    {
        return type;
    }
    public void setType(Type type)
    {
        this.type = type;
    }
 
    public void build (HttpServletResponse response, boolean stripFilename) throws ServletException, IOException
    {
        response.setDateHeader("Expires", 0);
        response.setContentType(this.contentType);
        
        if (stripFilename)
        {
            int idx = this.filename.lastIndexOf(".");
            if (idx > 0)
            {
                String name = this.filename.substring(0,idx);
                String ext = this.filename.substring(idx);
                this.filename = name.replaceAll("\\W*","") + ext;
            }
            else
            {
                this.filename = this.filename.replaceAll("\\W*", "");
            }
        }
        
        if (this.type == Type.ATTACHMENT)
        {
            response.setHeader("Content-Disposition", "attachment; filename="+this.filename);
        }
        else if (this.type == Type.INLINE)
        {
            response.setHeader("Content-Disposition", "inline; filename="+this.filename);
        }
        response.setStatus(this.statusCode);
        if (!this.headers.isEmpty())
        {
            for (Iterator<String> it = this.headers.keySet().iterator(); it.hasNext();)
            {
                String key = it.next();
                response.setHeader(key, this.headers.get(key));
            }
        }
    }

}
