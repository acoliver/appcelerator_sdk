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