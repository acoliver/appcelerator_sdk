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
package org.appcelerator.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.xml.serialize.OutputFormat;
import org.apache.xml.serialize.XMLSerializer;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;


/**
 * Util is a general collection of utility functions.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 */
public class Util
{
    private static String hex_chr = "0123456789abcdef";
    private static final DocumentBuilderFactory xmlFactory = DocumentBuilderFactory.newInstance();


    /**
     * limit a string size and if it exceeds the limit, return a truncated value
     * with ellipsis
     *
     * @param str   string to limit
     * @param limit length to limit string to
     * @return limited string
     */
    public static String limit(String str, int limit)
    {
        if (str == null) return null;

        int len = str.length();

        if (len <= limit || limit <= 3)
        {
            return str;
        }

        return str.substring(0, Math.min(len, limit)) + "...";
    }

    /**
     * find the first tag in an element as the child
     *
     * @param element element to perform getElementsByTagName against
     * @param tagName tag name
     * @return first tag if found or <code>null</code> otherwise
     */
    public static Element findFirstElement(Element element, String tagName)
    {
        if (element != null)
        {
            NodeList list = element.getElementsByTagName(tagName);
            if (list != null && list.getLength() > 0)
            {
                return (Element) list.item(0);
            }
        }
        return null;
    }

    /**
     * recursively delete the entire directory, including subdirectories
     *
     * @param dir directory to delete
     */
    public static void deltree(File dir)
    {
        for (File file : dir.listFiles())
        {
            if (file.isDirectory())
            {
                deltree(file);
            }
            else
            {
                file.delete();
            }
        }
        dir.delete();
    }

    /**
     * simple serializer interface
     */
    public static interface Serializer<T>
    {
        /**
         * serialize the specified entity
         *
         * @param t entity
         * @return serialized t
         */
        public String serialize(T t);
    }

    public static String join(Object[] items, String separator)
    {
        return join(items,separator,0);
    }
    
    /**
     * join an array of items by <pre>separator</pre>
     *
     * @param items     items to join
     * @param separator seperator to use between items
     * @return string version of items seperated by seperator
     */
    public static String join(Object[] items, String separator, int x)
    {
        StringBuilder builder = new StringBuilder();
        int c=0, len = items.length;
        for (Object obj : items)
        {
            if (c >= x)
            {
                builder.append(obj);
                if (c+1 < len)
                {
                    builder.append(separator);
                }
            }
            c++;
        }
        return builder.toString();
    }

    /**
     * join the specified collection with specified seperator using serializer to serialize items in collection
     *
     * @param collection items
     * @param separator  seperator to use between items
     * @param serializer serializer to use on items
     * @return string version of items seperated by seperator
     */
    public static <T> String join(Collection<T> collection, String separator, Serializer<T> serializer)
    {
        return join(collection, separator, serializer, Integer.MAX_VALUE);
    }

    /**
     * join each entry into a string separated by <pre>separator</pre>
     *
     * @param collection items to join
     * @param separator  seperator to use between items
     * @param serializer serializer to use on items
     * @param max        number to join together
     * @return string version of items seperated by seperator
     */
    public static <T> String join(Collection<T> collection, String separator, Serializer<T> serializer, int max)
    {
        StringBuilder builder = new StringBuilder();
        if (collection != null && !collection.isEmpty())
        {
            int c = 0;
            Iterator<T> iter = collection.iterator();
            while (iter.hasNext())
            {
                String value = (serializer != null) ? serializer.serialize(iter.next()) : iter.next().toString();
                builder.append(value);
                if (++c >= max) break;
                if (iter.hasNext())
                {
                    builder.append(separator);
                }
            }
        }
        return builder.toString();
    }

    /**
     * serialize XML to a string
     *
     * @param xml xml document to serialize
     * @return serialized xml document
     * @throws IOException upon serialization error
     */
    public static String serialize(Document xml) throws IOException
    {
        StringWriter writer = new StringWriter();
        serialize(xml, writer);
        return writer.toString();
    }

    /**
     * serialize xml to a writer
     *
     * @param xml    xml to serialize
     * @param writer writer to use
     * @throws IOException upoon serialization error
     */
    public static void serialize(Document xml, Writer writer) throws IOException
    {
        OutputFormat format = new OutputFormat(xml);
        XMLSerializer serializer = new XMLSerializer(writer, format);
        format.setOmitXMLDeclaration(false);
        serializer.asDOMSerializer().serialize(xml);
    }

    /**
     * create a new empty DOM document
     *
     * @return new empty document
     */
    public static Document createDocument()
    {
        try
        {
            return xmlFactory.newDocumentBuilder().newDocument();
        }
        catch (ParserConfigurationException e)
        {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    /**
     * given an input stream, parse it into DOM
     *
     * @param in input stream to parse
     * @return parsed document from stream
     * @throws Exception upon parse or stream error
     */
    public static Document toXML(InputStream in) throws Exception
    {
        return xmlFactory.newDocumentBuilder().parse(in);
    }

    /**
     * given a string blob of XML, return a DOM object
     *
     * @param blob string blob of xml
     * @return parsed document
     * @throws Exception upon error
     */
    public static Document toXML(String blob) throws Exception
    {
        return toXML(new ByteArrayInputStream(blob.getBytes()));
    }

    /**
     * gets resource as a string from servlet class or context.
     *
     * @param servlet servlet
     * @param name    resource name to get
     * @return resource as string
     * @throws Exception upon error
     */
    public static String getResource(HttpServlet servlet, String name) throws Exception
    {
        InputStream stream = servlet.getClass().getResourceAsStream(name);
        if (stream == null)
        {
            stream = servlet.getServletContext().getResourceAsStream(name);
        }
        byte buf[] = new byte[1024];
        StringBuilder builder = new StringBuilder();
        while (true)
        {
            int c = stream.read(buf);
            if (c < 0) break;
            builder.append(new String(buf, 0, c));
        }
        return builder.toString();
    }

    /**
     * copy an input stream into a string
     *
     * @param in input stream to copy
     * @return input stream read into string
     * @throws IOException upon error
     */
    public static String copyToString(InputStream in) throws IOException
    {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        copy(in, out);
        return out.toString();
    }

    /**
     * more efficient multiple file copy which allows copying one input source
     * to multiple file targets
     *
     * @param source  input source
     * @param targets targets to copy file to
     * @throws IOException upon error
     */
    public static void multiCopy(File source, File... targets) throws IOException
    {
        FileInputStream in = new FileInputStream(source);
        try
        {
            FileOutputStream fos[] = new FileOutputStream[targets.length];
            int c = 0;
            for (File f : targets)
            {
                fos[c++] = new FileOutputStream(f);
            }
            byte buffer[] = new byte[4096];
            while (true)
            {
                int count = in.read(buffer);
                if (count < 0)
                {
                    break;
                }
                for (FileOutputStream fo : fos)
                {
                    fo.write(buffer, 0, count);
                }
            }
            for (FileOutputStream fo : fos)
            {
                closeQuietly(fo);
            }
        }
        finally
        {
            closeQuietly(in);
        }
    }
    
    /**
     * close quietly the InputStream without throwing any exceptions
     * 
     * @param in
     */
    public static void closeQuietly (InputStream in)
    {
        try
        {
            if (in!=null) in.close();
            in = null;
        }
        catch (Exception ex)
        {
            
        }
    }
    
    /**
     * close quietly the OutputStream without throwing any exceptions
     * 
     * @param out
     */
    public static void closeQuietly (OutputStream out)
    {
        try
        {
            if (out!=null) out.close();
            out = null;
        }
        catch (Exception ex)
        {
            
        }
    }
    
    /**
     * write string to file
     * 
     * @param buffer
     * @param out
     * @throws IOException
     */
    public static void copyToFile (String buffer, File out) throws IOException
    {
        FileOutputStream fout = new FileOutputStream(out);
        try
        {
            copy(new ByteArrayInputStream(buffer.getBytes()),fout);
            fout.flush();
        }
        finally
        {
            try { fout.close(); } catch (Exception ignore) { }
        }
    }

    /**
     * copy input stream to output stream
     *
     * @param in  input stream to copy out
     * @param out output stream to stream input into
     * @return bytes copied
     * @throws IOException upon error
     */
    public static int copy(InputStream in, OutputStream out) throws IOException
    {
        return copy(in, out, false);
    }

    /**
     * copy an input stream to an output stream and return the number of bytes copied
     *
     * @param in       input stream to copy out
     * @param out      output stream to stream input into
     * @param keepOpen <code>true</code> to keep output stream open, <code>false</code> otherwise
     * @return bytes copied
     * @throws IOException upon error
     */
    public static int copy(InputStream in, OutputStream out, boolean keepOpen) throws IOException
    {
        int count = 0;
        byte buf[] = new byte[4096];

        while (in != null)
        {
            int len = in.read(buf);
            if (len < 0)
            {
                break;
            }
            if (out != null && len > 0)
            {
                out.write(buf, 0, len);
            }
            count += len;
        }

        if (out != null && !keepOpen)
        {
            out.close();
        }
        return count;
    }

    /**
     * copy infile to output dir
     * 
     * @param infile
     * @param dir
     * @throws IOException
     */
    public static void copy (File infile, File dir) throws IOException
    {
        dir.mkdirs();
        FileOutputStream out = new FileOutputStream(new File(dir,infile.getName()));
        FileInputStream in = new FileInputStream(infile);
        try
        {
            copy(in,out);
        }
        finally
        {
            try { in.close(); } catch (Exception ignore) { }
        }
    }

    /**
     * copy infile to output dir
     * 
     * @param infile
     * @param dir
     * @throws IOException
     */
    public static void copyFile (File infile, File outfile) throws IOException
    {
        outfile.getParentFile().mkdirs();
        outfile.createNewFile();
        FileOutputStream out = new FileOutputStream(outfile,false);
        FileInputStream in = new FileInputStream(infile);
        try
        {
            copy(in,out);
        }
        finally
        {
            try { in.close(); } catch (Exception ignore) { }
        }
    }

    private static final Map<String, String> DECODE_XML_ENTITY_TABLE = new HashMap<String, String>(9);
    private static final Map<String, String> ENCODE_XML_ENTITY_TABLE = new HashMap<String, String>(9);

    static
    {
        DECODE_XML_ENTITY_TABLE.put("amp", "&");
        DECODE_XML_ENTITY_TABLE.put("quot", "\"");
        DECODE_XML_ENTITY_TABLE.put("lt", "<");
        DECODE_XML_ENTITY_TABLE.put("gt", ">");
        DECODE_XML_ENTITY_TABLE.put("apos", "'");
        DECODE_XML_ENTITY_TABLE.put("rsquo", "`");
        DECODE_XML_ENTITY_TABLE.put("#40", "(");
        DECODE_XML_ENTITY_TABLE.put("#41", ")");
        DECODE_XML_ENTITY_TABLE.put("#58", ":");

        ENCODE_XML_ENTITY_TABLE.put("&", "amp");
        ENCODE_XML_ENTITY_TABLE.put("\"", "quot");
        ENCODE_XML_ENTITY_TABLE.put("<", "lt");
        ENCODE_XML_ENTITY_TABLE.put(">", "gt");
        ENCODE_XML_ENTITY_TABLE.put("'", "apos");
        ENCODE_XML_ENTITY_TABLE.put("`", "rsquo");
        ENCODE_XML_ENTITY_TABLE.put("(", "#40");
        ENCODE_XML_ENTITY_TABLE.put(")", "#41");
        ENCODE_XML_ENTITY_TABLE.put(":", "58");
    }

    private static final Pattern XML_PATTERN = Pattern.compile("([&\"<>'`\\(\\):])", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);
    private static final Pattern UN_XML_PATTERN = Pattern.compile("&([#]?[a-z0-9]+);", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    /**
     * unescape any XML entities found in value
     *
     * @param value value to unescape
     * @return unescaped value
     */
    public static String unescapeXML(String value)
    {
        if (value == null || value.trim().length() == 0)
        {
            return "";
        }
        Matcher matcher = UN_XML_PATTERN.matcher(value);
        StringBuilder builder = new StringBuilder();
        int offset = 0;
        while (matcher.find())
        {
            String group = matcher.group(1);
            String symbol = DECODE_XML_ENTITY_TABLE.get(group);
            if (symbol != null)
            {
                builder.append(value.substring(offset, matcher.start()));
                builder.append(symbol);
            }
            else
            {
                builder.append(matcher.group());
            }
            offset = matcher.end();
        }
        if (offset == 0)
        {
            return value;
        }
        if (offset < value.length())
        {
            builder.append(value.substring(offset));
        }
        return builder.toString();
    }

    /**
     * escape any xml entities found in value
     *
     * @param value value to escape
     * @return escaped value
     */
    public static String escapeXML(String value)
    {
        if (value == null || value.trim().length() == 0)
        {
            return "";
        }
        Matcher matcher = XML_PATTERN.matcher(value);
        StringBuilder builder = new StringBuilder();
        int offset = 0;
        while (matcher.find())
        {
            String group = matcher.group(1);
            String symbol = ENCODE_XML_ENTITY_TABLE.get(group);
            if (symbol != null)
            {
                builder.append(value.substring(offset, matcher.start()));
                builder.append("&");
                builder.append(symbol);
                builder.append(";");
            }
            else
            {
                builder.append(matcher.group());
            }
            offset = matcher.end();
        }
        if (offset == 0)
        {
            return value;
        }
        if (offset < value.length())
        {
            builder.append(value.substring(offset));
        }
        return builder.toString();
    }

    /**
     * Converts the given array of bytes to a hex String
     *
     * @param buf bytes to convert
     * @return hex string
     */
    public static String toHexString(byte[] buf)
    {
        char[] cbf = new char[buf.length * 2];
        for (int jj = 0, kk = 0; jj < buf.length; jj++)
        {
            cbf[kk++] = "0123456789ABCDEF".charAt((buf[jj] >> 4) & 0x0F);
            cbf[kk++] = "0123456789ABCDEF".charAt(buf[jj] & 0x0F);
        }
        return new String(cbf);
    }

    /**
     * Converts a valid hex String to an array of bytes
     *
     * @param hex hex string to convert to bytes
     * @return bytes
     */
    public static byte[] fromHexString(String hex)
    {
        byte[] result = new byte[hex.length() / 2];
        for (int jj = 0, kk = 0; jj < result.length; jj++)
        {
            result[jj] = (byte) (("0123456789ABCDEF".indexOf(hex.charAt(kk++)) << 4) + "0123456789ABCDEF".indexOf(hex
                    .charAt(kk++)));
        }
        return result;
    }

    /**
     * Convert a 32-bit number to a hex string with ls-byte first
     *
     * @param num number to convert
     * @return hex string
     */
    private static String rhex(int num)
    {
        String str = "";
        for (int j = 0; j <= 3; j++)
        {
            str = str + hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) + hex_chr.charAt((num >> (j * 8)) & 0x0F);
        }
        return str;
    }

    /**
     * Convert a string to a sequence of 16-word blocks, stored as an array.
     * Append padding bits and the length, as described in the MD5 standard.
     *
     * @param str to convert
     * @return 16-word blocks
     */
    private static int[] str2blks_MD5(String str)
    {
        int nblk = ((str.length() + 8) >> 6) + 1;
        int[] blks = new int[nblk * 16];
        int i;
        for (i = 0; i < nblk * 16; i++)
        {
            blks[i] = 0;
        }
        for (i = 0; i < str.length(); i++)
        {
            blks[i >> 2] |= str.charAt(i) << ((i % 4) * 8);
        }
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = str.length() * 8;

        return blks;
    }

    /**
     * Add integers, wrapping at 2^32
     *
     * @param x integer 1
     * @param y integer 2
     * @return added value
     */
    private static int add(int x, int y)
    {
        return ((x & 0x7FFFFFFF) + (y & 0x7FFFFFFF)) ^ (x & 0x80000000) ^ (y & 0x80000000);
    }

    /**
     * Bitwise rotate a 32-bit number to the left
     *
     * @param num number to rotate
     * @param cnt to rotate
     * @return rotated number
     */
    private static int rol(int num, int cnt)
    {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /**
     * These functions implement the basic operation for each round of the algorithm.
     *
     * @param q q
     * @param a a
     * @param b b
     * @param x x
     * @param s s
     * @param t t
     * @return integer
     */
    private static int cmn(int q, int a, int b, int x, int s, int t)
    {
        return add(rol(add(add(a, q), add(x, t)), s), b);
    }

    /**
     * These functions implement the basic operation for each round of the algorithm.
     *
     * @param a a
     * @param b b
     * @param c c
     * @param d d
     * @param x x
     * @param s s
     * @param t t
     * @return integer
     */
    private static int ff(int a, int b, int c, int d, int x, int s, int t)
    {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    /**
     * These functions implement the basic operation for each round of the algorithm.
     *
     * @param a a
     * @param b b
     * @param c c
     * @param d d
     * @param x x
     * @param s s
     * @param t t
     * @return integer
     */
    private static int gg(int a, int b, int c, int d, int x, int s, int t)
    {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    /**
     * These functions implement the basic operation for each round of the algorithm.
     *
     * @param a a
     * @param b b
     * @param c c
     * @param d d
     * @param x x
     * @param s s
     * @param t t
     * @return integer
     */
    private static int hh(int a, int b, int c, int d, int x, int s, int t)
    {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    /**
     * These functions implement the basic operation for each round of the algorithm.
     *
     * @param a a
     * @param b b
     * @param c c
     * @param d d
     * @param x x
     * @param s s
     * @param t t
     * @return integer
     */
    private static int ii(int a, int b, int c, int d, int x, int s, int t)
    {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /**
     * Take a string and return the hex representation of its MD5.
     *
     * @param str string to calc md5 for
     * @return MD5
     */
    public static String calcMD5(String str)
    {
        int[] x = str2blks_MD5(str);
        int a = 0x67452301;
        int b = 0xEFCDAB89;
        int c = 0x98BADCFE;
        int d = 0x10325476;

        for (int i = 0; i < x.length; i += 16)
        {
            int olda = a;
            int oldb = b;
            int oldc = c;
            int oldd = d;

            a = ff(a, b, c, d, x[i], 7, 0xD76AA478);
            d = ff(d, a, b, c, x[i + 1], 12, 0xE8C7B756);
            c = ff(c, d, a, b, x[i + 2], 17, 0x242070DB);
            b = ff(b, c, d, a, x[i + 3], 22, 0xC1BDCEEE);
            a = ff(a, b, c, d, x[i + 4], 7, 0xF57C0FAF);
            d = ff(d, a, b, c, x[i + 5], 12, 0x4787C62A);
            c = ff(c, d, a, b, x[i + 6], 17, 0xA8304613);
            b = ff(b, c, d, a, x[i + 7], 22, 0xFD469501);
            a = ff(a, b, c, d, x[i + 8], 7, 0x698098D8);
            d = ff(d, a, b, c, x[i + 9], 12, 0x8B44F7AF);
            c = ff(c, d, a, b, x[i + 10], 17, 0xFFFF5BB1);
            b = ff(b, c, d, a, x[i + 11], 22, 0x895CD7BE);
            a = ff(a, b, c, d, x[i + 12], 7, 0x6B901122);
            d = ff(d, a, b, c, x[i + 13], 12, 0xFD987193);
            c = ff(c, d, a, b, x[i + 14], 17, 0xA679438E);
            b = ff(b, c, d, a, x[i + 15], 22, 0x49B40821);

            a = gg(a, b, c, d, x[i + 1], 5, 0xF61E2562);
            d = gg(d, a, b, c, x[i + 6], 9, 0xC040B340);
            c = gg(c, d, a, b, x[i + 11], 14, 0x265E5A51);
            b = gg(b, c, d, a, x[i], 20, 0xE9B6C7AA);
            a = gg(a, b, c, d, x[i + 5], 5, 0xD62F105D);
            d = gg(d, a, b, c, x[i + 10], 9, 0x02441453);
            c = gg(c, d, a, b, x[i + 15], 14, 0xD8A1E681);
            b = gg(b, c, d, a, x[i + 4], 20, 0xE7D3FBC8);
            a = gg(a, b, c, d, x[i + 9], 5, 0x21E1CDE6);
            d = gg(d, a, b, c, x[i + 14], 9, 0xC33707D6);
            c = gg(c, d, a, b, x[i + 3], 14, 0xF4D50D87);
            b = gg(b, c, d, a, x[i + 8], 20, 0x455A14ED);
            a = gg(a, b, c, d, x[i + 13], 5, 0xA9E3E905);
            d = gg(d, a, b, c, x[i + 2], 9, 0xFCEFA3F8);
            c = gg(c, d, a, b, x[i + 7], 14, 0x676F02D9);
            b = gg(b, c, d, a, x[i + 12], 20, 0x8D2A4C8A);

            a = hh(a, b, c, d, x[i + 5], 4, 0xFFFA3942);
            d = hh(d, a, b, c, x[i + 8], 11, 0x8771F681);
            c = hh(c, d, a, b, x[i + 11], 16, 0x6D9D6122);
            b = hh(b, c, d, a, x[i + 14], 23, 0xFDE5380C);
            a = hh(a, b, c, d, x[i + 1], 4, 0xA4BEEA44);
            d = hh(d, a, b, c, x[i + 4], 11, 0x4BDECFA9);
            c = hh(c, d, a, b, x[i + 7], 16, 0xF6BB4B60);
            b = hh(b, c, d, a, x[i + 10], 23, 0xBEBFBC70);
            a = hh(a, b, c, d, x[i + 13], 4, 0x289B7EC6);
            d = hh(d, a, b, c, x[i], 11, 0xEAA127FA);
            c = hh(c, d, a, b, x[i + 3], 16, 0xD4EF3085);
            b = hh(b, c, d, a, x[i + 6], 23, 0x04881D05);
            a = hh(a, b, c, d, x[i + 9], 4, 0xD9D4D039);
            d = hh(d, a, b, c, x[i + 12], 11, 0xE6DB99E5);
            c = hh(c, d, a, b, x[i + 15], 16, 0x1FA27CF8);
            b = hh(b, c, d, a, x[i + 2], 23, 0xC4AC5665);

            a = ii(a, b, c, d, x[i], 6, 0xF4292244);
            d = ii(d, a, b, c, x[i + 7], 10, 0x432AFF97);
            c = ii(c, d, a, b, x[i + 14], 15, 0xAB9423A7);
            b = ii(b, c, d, a, x[i + 5], 21, 0xFC93A039);
            a = ii(a, b, c, d, x[i + 12], 6, 0x655B59C3);
            d = ii(d, a, b, c, x[i + 3], 10, 0x8F0CCC92);
            c = ii(c, d, a, b, x[i + 10], 15, 0xFFEFF47D);
            b = ii(b, c, d, a, x[i + 1], 21, 0x85845DD1);
            a = ii(a, b, c, d, x[i + 8], 6, 0x6FA87E4F);
            d = ii(d, a, b, c, x[i + 15], 10, 0xFE2CE6E0);
            c = ii(c, d, a, b, x[i + 6], 15, 0xA3014314);
            b = ii(b, c, d, a, x[i + 13], 21, 0x4E0811A1);
            a = ii(a, b, c, d, x[i + 4], 6, 0xF7537E82);
            d = ii(d, a, b, c, x[i + 11], 10, 0xBD3AF235);
            c = ii(c, d, a, b, x[i + 2], 15, 0x2AD7D2BB);
            b = ii(b, c, d, a, x[i + 9], 21, 0xEB86D391);

            a = add(a, olda);
            b = add(b, oldb);
            c = add(c, oldc);
            d = add(d, oldd);
        }
        return rhex(a) + rhex(b) + rhex(c) + rhex(d);
    }

    /**
     * returns default if null otherwise value
     *
     * @param s   string to test
     * @param def default to return if null
     * @return def if null or s otherwise
     */
    public static String notNull(Object s, String def)
    {
        if (s == null)
        {
            return def;
        }
        return s.toString();
    }

    /**
     * gets the content for the specified node
     *
     * @param n node
     * @return node's content
     */
    public static String getNodeContent(Node n)
    {
        if (n == null) return null;

        StringBuilder builder = new StringBuilder();
        NodeList list = n.getChildNodes();
        int len = list.getLength();
        for (int c = 0; c < len; c++)
        {
            Node node = list.item(c);
            short type = node.getNodeType();
            switch (type)
            {
                case Node.CDATA_SECTION_NODE:
                case Node.TEXT_NODE:
                    builder.append(node.getNodeValue());
                    break;
            }
        }
        return builder.toString();
    }

    /**
     * builds OR query and appends to string build
     *
     * @param builder string builder
     * @param field   field name
     * @param tags    values
     */
    public static void buildQuery(StringBuilder builder, String field, String tags[])
    {
        if (builder.length() > 0)
        {
            builder.append(" OR ");
        }
        builder.append(field).append(":(");
        for (int c = 0; c < tags.length; c++)
        {
            builder.append("\"");
            builder.append(tags[c]);
            builder.append("\"");
            if (c + 1 < tags.length)
            {
                builder.append(" OR ");
            }
        }
        builder.append(")");
    }

    /**
     * add a cookie
     *
     * @param response http servlet response
     * @param name     cookie name
     * @param value    cookie value
     * @param maxage   cookie max age
     */
    public static Cookie addCookie(HttpServletResponse response, String name, String value, String domain, int maxage)
    {
        Cookie cookie = new Cookie(name, value);
        cookie.setMaxAge(maxage);
        cookie.setPath("/");
        if (domain!=null) cookie.setDomain(domain);
        response.addCookie(cookie);
        return cookie;
    }

    /**
     * add a cookie
     *
     * @param response http servlet response
     * @param name     cookie name
     * @param value    cookie value
     * @param maxage   cookie max age
     */
    public static Cookie addCookie(HttpServletResponse response, String name, String value, int maxage)
    {
        return addCookie(response,name,value,null,maxage);
    }

    /**
     * delete a cookie
     *
     * @param response htttp servlet response
     * @param name     cookie name
     */
    public static void deleteCookie(HttpServletResponse response, String name)
    {
        Cookie cookie = new Cookie(name, "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    /**
     * delete all cookies based on a regular expression pattern match
     *
     * @param request  http servlet request
     * @param response http servlet response
     * @param pattern  regex pattern
     */
    public static void deleteCookies(HttpServletRequest request, HttpServletResponse response, String pattern)
    {
        Cookie[] cookies = request.getCookies();
        if (null == cookies)
        {
            return;
        }

        for (Cookie cookie : cookies)
        {
            if (cookie.getName().matches(pattern))
            {
                cookie.setMaxAge(0);
                cookie.setValue("");
                response.addCookie(cookie);
            }
        }
    }

    /**
     * given a request and cookie name, return the value or null if not found
     *
     * @param req  http servlet request
     * @param name cookie name
     * @return cookie value or <code>null</code> if cookie not found
     */
    public static String getCookieValue(HttpServletRequest req, String name)
    {
        Cookie cookies[] = req.getCookies();
        if (cookies != null)
        {
            for (Cookie cookie : cookies)
            {
                if (cookie.getName().equals(name))
                {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    /**
     * parse an input stream as XML and return Document object
     *
     * @param in input stream
     * @return parsed document
     * @throws Exception upon error
     */
    public static Document parse(InputStream in) throws Exception
    {
        return builder.parse(in);
    }

    static DocumentBuilder builder;

    static
    {
        try
        {
            builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
        }
        catch (ParserConfigurationException e)
        {
            e.printStackTrace();
        }
    }

    /**
     * given a list of tokenized string values, return them as a set separated by tokens
     *
     * @param data   data to build set from
     * @param tokens tokens
     * @return set
     */
    public static Set<String> buildSet(String data, String tokens)
    {
        Set<String> set = new HashSet<String>();
        if (data != null)
        {
            StringTokenizer tok = new StringTokenizer(data, tokens);
            while (tok.hasMoreTokens())
            {
                String token = tok.nextToken();
                String t = token.trim();
                if (t.length() > 0)
                {
                    set.add(t);
                }
            }
        }
        return set;
    }

    /**
     * converts a string to title case
     *
     * @param string input string to conver
     * @return string title cased
     */
    public static String toTitleCase(String string)
    {
        if (string != null)
        {
            StringBuilder stringBuilder = new StringBuilder();
            int length;
            if (0 < (length = string.length()))
            {
                stringBuilder.append(Character.toTitleCase(string.charAt(0)));
                if (1 < length)
                {
                    stringBuilder.append(string.substring(1).toLowerCase());
                }
            }

            return stringBuilder.toString();
        }

        return null;
    }

    /**
     * String implementation of Serializer
     */
    public static class StringSerializer implements Util.Serializer<String>
    {
        /**
         * serialize the specified entity
         *
         * @param t entity
         * @return serialized t
         */
        public String serialize(String t)
        {
            return t;
        }
    }

    public static final StringSerializer STRING_SERIALIZER = new StringSerializer();

    /**
     * builds a serialized string list
     *
     * @param strings collection of strings to serialize
     * @return serialized string list
     */
    public static String buildSerializedStringList(Collection<String> strings)
    {
        return buildSerializedStringList(strings, Integer.MAX_VALUE);
    }

    /**
     * builds a serialized string list
     *
     * @param strings    collection of strings to serialize
     * @param maxStrings max strings to join
     * @return serialized string list
     */
    public static String buildSerializedStringList(Collection<String> strings, int maxStrings)
    {
        return join(strings, ",", STRING_SERIALIZER, maxStrings);
    }
    
    
    /**
     * extract a jar file to directory
     * 
     * @param file
     * @param dir
     * @throws IOException
     */
    public static void extractJAR (File file, File dir) throws IOException
    {
        JarFile jf = new JarFile(file);
        Enumeration<JarEntry> entries = jf.entries();
        while (entries.hasMoreElements())
        {
            JarEntry entry = (JarEntry)entries.nextElement();
            if (entry.isDirectory())
            {
                File newdir = new File(dir,entry.getName());
                newdir.mkdirs();
            }
            else
            {
                File newfile = new File(dir,entry.getName());
                FileOutputStream out = new FileOutputStream(newfile);
                InputStream in = jf.getInputStream(entry);
                Util.copy(in, out, true);
                in.close();
            }
        }
    }
    
    private static final Pattern IPADDRESS = Pattern.compile("[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}");
    private static final Pattern DOMAIN = Pattern.compile("(.*?)(\\.[\\w]+\\.[\\w]+)$");

    /**
     * given a FQDN return the root part of the domain for example:
     * 
     * www.google.com would return .google.com
     * 
     * @param servername
     * @return
     */
    public static String getDomain (String servername)
    {
        if (servername!=null)
        {
            if (!IPADDRESS.matcher(servername).matches())
            {
                Matcher matcher = DOMAIN.matcher(servername);
                if (matcher.find())
                {
                    return matcher.group(2);
                }
            }
        }
        return null;
    }

}
