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
package org.appcelerator.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * HttpUtil
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class HttpUtil
{
    public static final String USER_AGENT = "User-Agent";
    public static final String EXPIRES = "Expires";
    public static final String LAST_MODIFIED = "Last-Modified";
    public static final String DATE = "Date";
    public static final String ETAG = "ETag";
    public static final String CONTENT_TYPE = "Content-Type";
    public static final String X_PINGBACK = "X-Pingback";

    public static String getUserAgent(HttpURLConnection connection)
    {
        return connection.getHeaderField(USER_AGENT);
    }

    public static long getExpires(HttpURLConnection connection)
    {
        return connection.getHeaderFieldDate(EXPIRES, -1);
    }

    public static long getLastModified(HttpURLConnection connection)
    {
        return connection.getHeaderFieldDate(LAST_MODIFIED, -1);
    }

    public static long getDate(HttpURLConnection connection)
    {
        return connection.getHeaderFieldDate(DATE, -1);
    }

    public static String getETag(HttpURLConnection connection)
    {
        return connection.getHeaderField(ETAG);
    }

    public static String getContentTypeSpecified(URLConnection connection)
    {
        return connection.getHeaderField(CONTENT_TYPE);
    }
    public static String getContentTypeDetermined(HttpUtil.FetchedUrlConnection connection)
    {
    	return getContentTypeDetermined(connection,"UTF-8");
    }
    public static String getContentTypeDetermined(HttpUtil.FetchedUrlConnection connection, String encoding)
    {
        String contentType = getContentTypeSpecified(connection.getConnection());

        if (null != contentType && contentType.startsWith("text/plain"))
        {
            String output = connection.getOutput();
            if (output.startsWith("<?xml "))
            {
                contentType = contentType.replace("text/plain", "text/xml;charset="+encoding);
            }
        }

        return contentType;
    }

    public static String getPingbackServer(HttpURLConnection connection)
    {
        return connection.getHeaderField(X_PINGBACK);
    }

    public static void main(String args[]) throws Exception
    {
        System.err.println(fileExists(new URL("http://blog.jeffhaynie.us/favicon.ico")));
        System.err.println(fileExists(new URL("http://www.myspace.com/favicon.ico")));
    }

    public interface IVisitor
    {
        /**
         * return true to determine true for fileExists, false for not
         *
         * @param url
         * @param connection
         * @return
         */
        public boolean visit(URL url, URLConnection connection);
    }

    /**
     * create a content type visitor that will match a pattern for the content type HTTP header
     *
     * @param pattern
     * @return
     */
    public static IVisitor createContentTypeVisitor(final Pattern pattern)
    {
        return new IVisitor()
        {
            public boolean visit(URL url, URLConnection connection)
            {
                if (connection instanceof HttpURLConnection)
                {
                    HttpURLConnection conn = (HttpURLConnection) connection;
                    String type = conn.getContentType();
                    if (type != null)
                    {
                        return pattern.matcher(type).matches();
                    }
                }
                return false;
            }
        };
    }

    /**
     * returns true if the file exists, false if not
     *
     * @param url
     * @return
     */
    public static boolean fileExists(URL url)
    {
        return fileExists(url, null);
    }

    /**
     * returns true if the file exists, false if not
     *
     * @param url
     * @param visitor
     * @return
     */
    public static boolean fileExists(URL url, IVisitor visitor)
    {
        URLConnection connection = null;
        try
        {
            connection = connect(url, "HEAD");
            if (connection instanceof HttpURLConnection)
            {
                InputStream inputStream = connection.getInputStream();
                Util.copy(inputStream, (OutputStream) null);
            }

            return visitor == null || visitor.visit(url, connection);
        }
        catch (Exception ex)
        {
            return false;
        }
        finally
        {
            if (connection != null && connection instanceof HttpURLConnection)
            {
                ((HttpURLConnection) connection).disconnect();
            }
        }
    }

    /**
     * FetchedUrlConnection
     *
     * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
     */
    public static class FetchedUrlConnection
    {
        private final URLConnection connection;
        private final String output;
        private final Map<String, List<String>> headers;

        public FetchedUrlConnection(URLConnection connection, String output, Map<String, List<String>> headers)
        {
            this.connection = connection;
            this.output = output;
            this.headers = headers;
        }

        public Map<String, List<String>> getHeaders()
        {
            return this.headers;
        }

        public URLConnection getConnection()
        {
            return connection;
        }

        public String getOutput()
        {
            return output;
        }
    }


    public static FetchedUrlConnection fetch(URL url) throws IOException
    {
        URLConnection connection = connect(url);
        try
        {
            InputStream inputStream = connection.getInputStream();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream(8192);
            Util.copy(inputStream, outputStream);

            Map<String, List<String>> headers = null;
            if (connection instanceof HttpURLConnection)
            {
                HttpURLConnection httpConnection = (HttpURLConnection) connection;
                headers = httpConnection.getHeaderFields();
            }

            return new FetchedUrlConnection(connection, outputStream.toString(), headers);
        }
        finally
        {
            if (connection instanceof HttpURLConnection)
            {
                ((HttpURLConnection) connection).disconnect();
            }
        }
    }

    public static URLConnection connect(URL url) throws IOException
    {
        return connect(url, "GET");
    }
    public static URLConnection connect(URL url, String method) throws IOException
    {
        return connect(url,method,null,true);
    }

    public static URLConnection connect(URL url, String method, Map<String,String> props, boolean connect) throws IOException
    {
        URLConnection connection = url.openConnection();
        connection.addRequestProperty(USER_AGENT, UserAgent.NAME);
        if (props!=null)
        {
            for (String prop : props.keySet())
            {
                connection.setRequestProperty(prop, props.get(prop));
            }
        }
        if (connection instanceof HttpURLConnection)
        {
            HttpURLConnection httpConn = (HttpURLConnection) connection;
            httpConn.setAllowUserInteraction(false);
            httpConn.setInstanceFollowRedirects(true);
            httpConn.setRequestMethod(method);
        }
        if (connect) connection.connect();
        return connection;
    }
}
