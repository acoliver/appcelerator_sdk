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

public class MemoryFormat
{
    public static final long BYTE = 1;

    public static final long KILOBYTE = 1024;

    public static final long MEGABYTE = (long)Math.pow(KILOBYTE, 2);

    public static final long GIGABYTE = (long)Math.pow(KILOBYTE,3);

    public static final long TERABYTE = (long)Math.pow(KILOBYTE,4);

    private long size;
    private String value;

    /**
     * create a memory format object by a string, in the format: 10MB, 1K,
     * 100GB, 10234, etc.
     */
    public MemoryFormat(String s)
    {
        this.size = valueOf(s);
        this.value = s;
    }

    /**
     * return the size in bytes for the object
     */
    public long getSize()
    {
        return this.size;
    }

    /**
     * return the value
     */
    public String toString()
    {
        return value;
    }

    /**
     * return the size
     */
    public static long valueOf(String s)
    {
        try
        {
            return Long.valueOf(s).longValue();
        }
        catch (NumberFormatException ex)
        {
        }

        int len = s.length();
        long size = 0L;

        boolean megs = false;
        boolean kilos = false;
        boolean gigas = false;

        StringBuilder buf = new StringBuilder();
        boolean added = false;

        for (int c = 0; c < len; c++)
        {
            char ch = s.charAt(c);

            // //System.out.println("c="+c+",len="+len+",ch="+ch+",pos="+position+",time="+time);
            if (ch == ' ')
            {

                // consume
                continue;
            }

            switch (ch)
            {

                case 'M':

                case 'm':
                    megs = true;
                    added = true;
                    kilos = gigas = false;

                    break;

                case 'K':

                case 'k':
                    kilos = true;
                    added = true;
                    megs = gigas = false;

                    break;

                case 'G':

                case 'g':
                    gigas = true;
                    added = true;
                    kilos = megs = false;

                    break;

                case 'B':

                case 'b':
                    if (kilos)
                    {
                        size += Integer.parseInt(buf.toString()) * KILOBYTE;
                    }
                    else if (megs)
                    {
                        size += Integer.parseInt(buf.toString()) * MEGABYTE;
                    }
                    else if (gigas)
                    {
                        size += Integer.parseInt(buf.toString()) * GIGABYTE;
                    }
                    added = false;

                    break;

                default:
                    buf.append(ch);

                    break;
            }
        }

        if (added)
        {
            if (kilos)
            {
                size += Integer.parseInt(buf.toString()) * KILOBYTE;
            }
            else if (megs)
            {
                size += Integer.parseInt(buf.toString()) * MEGABYTE;
            }
            else if (gigas)
            {
                size += Integer.parseInt(buf.toString()) * GIGABYTE;
            }
        }
        return size;
    }

    public static String valueOf(long memory)
    {
        long remainder = memory;
        long t = 0;
        long g = 0;
        long m = 0;
        long k = 0;
        long b = 0;

        if (remainder >= TERABYTE)
        {
            t = (remainder / TERABYTE);
            remainder -= t * TERABYTE;
        }
        else if (remainder >= GIGABYTE)
        {
            g = (remainder / GIGABYTE);
            remainder -= g * GIGABYTE;
        }
        else if (remainder >= MEGABYTE)
        {
            m = (remainder / MEGABYTE);
            remainder -= m * MEGABYTE;
        }
        else if (remainder >= KILOBYTE)
        {
            k = (remainder / KILOBYTE);
            remainder -= k * KILOBYTE;
        }
        else if (remainder >= BYTE)
        {
            b = (remainder / BYTE);
            remainder -= b * BYTE;
        }
        if (t > 0)
        {
            return t + "." + round(memory, remainder) + " TB";
        }
        if (g > 0)
        {
            return g + "." + round(memory, remainder) + " GB";
        }
        if (m > 0)
        {
            return m + "." + round(memory, remainder) + " MB";
        }
        if (k > 0)
        {
            return k + "." + round(memory, remainder) + " KB";
        }
        return b + " bytes";
    }

    private static String round(long basis, long r)
    {
        if (basis >= TERABYTE)
        {
            if (r < GIGABYTE)
            {
                return "0";
            }
        }
        if (basis >= GIGABYTE)
        {
            if (r < MEGABYTE)
            {
                return "0";
            }
        }
        if (basis >= MEGABYTE)
        {
            if (r < KILOBYTE)
            {
                return "0";
            }
        }
        String s = String.valueOf(r);
        int len = s.length();
        if (len >= 3)
        {
            int v = Integer.parseInt("" + s.charAt(2));
            if (v > 5)
            {
                int a = Integer.parseInt("" + s.charAt(0));
                int b = Integer.parseInt("" + s.charAt(1));
                return a + "" + (b + 1);
            }
            return s.substring(0, 2);
        }
        return s;
    }
    
    public static void main (String args[]) throws Exception
    {
        System.err.println("10MG is "+(MemoryFormat.MEGABYTE * 10));
        System.err.println("10MG is "+(MemoryFormat.valueOf(MemoryFormat.MEGABYTE * 10)));
        System.err.println("1MG is "+MemoryFormat.valueOf(MemoryFormat.MEGABYTE * 1));
    }
}