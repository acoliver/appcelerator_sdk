/*
 * Copyright 2003 Jayson Falkner (jayson@jspinsider.com)
 * This code is from "Servlets and JavaServer pages; the J2EE Web Tier",
 * http://www.jspbook.com. You may freely use the code both commercially
 * and non-commercially. If you like the code, please pick up a copy of
 * the book and help support the authors, development of more free code,
 * and the JSP/Servlet/J2EE community.
 */

/**
 *  Slight modifications by Jeff Haynie from original
 */

package org.appcelerator.servlet.filter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

public class GZIPResponseStream extends ServletOutputStream
{
    /**
     * this value is the number of bytes minimum that must be available to be compressed. at a small
     * size, the overhead of compression actually takes more bytes than uncompressed data
     */
    private static final int MIN_COMPRESSSION_SIZE = 2000;
    private static final Logger LOG = Logger.getLogger(GZIPResponseStream.class);
    private final ByteArrayOutputStream baos;
    private final GZIPOutputStream gzipstream;
    private final HttpServletResponse response;
    private final ServletOutputStream output;
    private final String uri;
    private boolean closed = false;
    private int inCount=0;
    private ByteArrayOutputStream shortBuffer=new ByteArrayOutputStream(MIN_COMPRESSSION_SIZE);

    public GZIPResponseStream(String uri,HttpServletResponse response) throws IOException
    {
        super();
        this.uri = uri;
        this.closed = false;
        this.response = response;
        this.output = response.getOutputStream();
        this.baos = new ByteArrayOutputStream();
        this.gzipstream = new GZIPOutputStream(baos);
    }

    public void close() throws IOException
    {
        if (closed)
        {
            throw new IOException("This output stream has already been closed");
        }
        
        gzipstream.flush();
        gzipstream.finish();

        int size = baos.size();
        
        // on return gzipped content if we have more than 0 bytes
        if (size>0)
        {
            if (size <= MIN_COMPRESSSION_SIZE && shortBuffer.size()>0)
            {
                // we didn't fill the short buffer, so send it instead of the uncompressed one
                shortBuffer.writeTo(output);
                response.setHeader("Content-Length", Integer.toString(shortBuffer.size()));
                if (LOG.isDebugEnabled())
                {
                    LOG.debug("GZIPPED "+this.uri+" skipped compression - in: "+size+" bytes, short size:"+shortBuffer.size()+" bytes");
                }
            }
            else
            {
                response.setHeader("Content-Length", Integer.toString(size));
                response.setHeader("Content-Encoding", "gzip");
                //a Vary: Accept-Encoding HTTP response header to alert proxies that a cached response should be sent only to 
                //clients that send the appropriate Accept-Encoding request header. This prevents compressed content from being sent 
                //to a client that will not understand it.
                response.addHeader("Vary","Accept-Encoding");
                baos.writeTo(output);
                if (LOG.isDebugEnabled())
                {
                    LOG.debug("GZIPPED "+this.uri+" - in: "+inCount+" bytes, out: "+size+" bytes");
                }
            }
            output.flush();
        }
        else
        {
            response.setHeader("Content-Length","0");
        }
        output.close();
        closed = true;
    }

    public void flush() throws IOException
    {
        if (closed)
        {
            throw new IOException("Cannot flush a closed output stream");
        }
        gzipstream.flush();
    }

    public void write(int b) throws IOException
    {
        if (closed)
        {
            throw new IOException("Cannot write to a closed output stream");
        }
        if (shortBuffer.size()<=MIN_COMPRESSSION_SIZE)
        {
            shortBuffer.write(b);
        }
        gzipstream.write((byte) b);
        inCount++;
    }

    public void write(byte b[]) throws IOException
    {
        write(b, 0, b.length);
        inCount+=b.length;
        if (shortBuffer.size()<=MIN_COMPRESSSION_SIZE)
        {
            if (shortBuffer.size() + b.length<=MIN_COMPRESSSION_SIZE)
            {
                shortBuffer.write(b);
            }
        }
    }

    public void write(byte b[], int off, int len) throws IOException
    {
        if (closed)
        {
            throw new IOException("Cannot write to a closed output stream");
        }
        gzipstream.write(b, off, len);
        inCount+=len;
        if (shortBuffer.size()<=MIN_COMPRESSSION_SIZE)
        {
            if (shortBuffer.size() + len<=MIN_COMPRESSSION_SIZE)
            {
                shortBuffer.write(b,off,len);
            }
        }
    }

    public boolean closed()
    {
        return (this.closed);
    }

    public void reset()
    {
        // noop
    }
}
