
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

package org.appcelerator.util;

import java.io.Serializable;

/**
 * TimeFormat is a utility class for converting a long into a
 * human readable string. <P>
 * <p/>
 * NOTE: I originally wrote this for JBoss JMX and submitted to
 * JBoss for inclusion in the JBoss AS.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public final class TimeFormat implements Serializable
{
    private static final long serialVersionUID = 1L;
    public static final boolean DEBUG = false;

    public static final long ONE_MILLISECOND = (1);
    public static final long ONE_SECOND = (ONE_MILLISECOND * 1000);
    public static final long ONE_MINUTE = (ONE_SECOND * 60);
    public static final long ONE_HOUR = (ONE_MINUTE * 60);
    public static final long ONE_DAY = (ONE_HOUR * 24);

    public static final int ROUND_TO_MILLISECOND = 5;
    public static final int ROUND_TO_SECOND = 4;
    public static final int ROUND_TO_MINUTE = 3;
    public static final int ROUND_TO_HOUR = 2;
    public static final int ROUND_TO_DAY = 1;

    private long original = 0;
    private long time = 0;
    private long remainder = 0;
    private long days = 0;
    private long hours = 0;
    private long minutes = 0;
    private long seconds = 0;
    private long milliseconds = 0;
    private boolean micro = false;
    private int rounding = ROUND_TO_SECOND;

    /**
     * construct a time format
     *
     * @param milliseconds milliseconds
     * @param round        value to round to
     * @see TimeFormat#ROUND_TO_MILLISECOND
     * @see TimeFormat#ROUND_TO_SECOND
     * @see TimeFormat#ROUND_TO_MINUTE
     * @see TimeFormat#ROUND_TO_HOUR
     * @see TimeFormat#ROUND_TO_DAY
     */
    private TimeFormat(long milliseconds, int round)
    {
        this.rounding = round;
        this.original = milliseconds;

        if (milliseconds >= ONE_SECOND)
        {
            this.remainder = milliseconds;

            getTime();
        }
        else
        {
            micro = true;

            // if less than second, we'll just
            // display
            time = milliseconds;
        }
    }

    /**
     * construct a time format
     *
     * @param milliseconds milliseconds
     */
    private TimeFormat(long milliseconds)
    {
        this(milliseconds, TimeFormat.ROUND_TO_MILLISECOND);
    }

    /**
     * get days
     *
     * @return days
     */
    public long getDays()
    {
        return days;
    }

    /**
     * get minutes
     *
     * @return minutes
     */
    public long getMinutes()
    {
        return minutes;
    }

    /**
     * get hours
     *
     * @return hours
     */
    public long getHours()
    {
        return hours;
    }

    /**
     * get seconds
     *
     * @return seconds
     */
    public long getSeconds()
    {
        return seconds;
    }

    /**
     * add a timeformat
     *
     * @param t time format to add
     */
    public void add(TimeFormat t)
    {
        days += t.days;
        hours += t.hours;
        minutes += t.minutes;
        seconds += t.seconds;
    }

    /**
     * get days from a time format
     *
     * @param t time format
     */
    public void getDays(TimeFormat t)
    {
        if (t.remainder >= ONE_DAY)
        {
            t.days = (t.remainder / ONE_DAY);
            t.remainder -= (t.days * ONE_DAY);
        }
    }

    /**
     * get hours from a time format
     *
     * @param t time format
     */
    public void getHours(TimeFormat t)
    {
        if (t.remainder >= ONE_HOUR && t.remainder < ONE_DAY)
        {
            t.hours = (t.remainder / ONE_HOUR);
            t.remainder -= (t.hours * ONE_HOUR);
        }
    }

    /**
     * get minutes from a time format
     *
     * @param t time format
     */
    public void getMinutes(TimeFormat t)
    {
        if (t.remainder >= ONE_MINUTE && t.remainder < ONE_HOUR)
        {
            t.minutes = (t.remainder / ONE_MINUTE);
            t.remainder -= (t.minutes * ONE_MINUTE);
        }
    }

    /**
     * get seconds from a time format
     *
     * @param t time format
     */
    public void getSeconds(TimeFormat t)
    {
        if (t.remainder >= ONE_SECOND && t.remainder < ONE_MINUTE)
        {
            t.seconds = (t.remainder / ONE_SECOND);
            t.milliseconds = t.remainder -= (t.seconds * ONE_SECOND);
        }
        else
        {
            t.seconds = 0;
            t.milliseconds = t.remainder;
        }
    }

    /**
     * update time
     *
     * @param t time format
     */
    public void getTime(TimeFormat t)
    {
        t.getTime();
    }

    /**
     * get time gets days, minutes, hours, and seconds
     *
     * @see TimeFormat#getDays()
     * @see TimeFormat#getHours()
     * @see TimeFormat#getMinutes()
     * @see TimeFormat#getSeconds()
     */
    private void getTime()
    {
        getDays(this);
        getHours(this);
        getMinutes(this);
        getSeconds(this);
    }

    /**
     * get the milliseconds
     *
     * @return milliseconds
     */
    public long getMilliseconds()
    {
        return (micro ? time : milliseconds);
    }

    /**
     * print out the time format in a string representation
     */
    public String toString()
    {
        return format(rounding);
    }

    /**
     * set rounding - one of ROUND_TO_MILLISECONDS, etc.
     *
     * @param r rounding
     * @see TimeFormat#ROUND_TO_MILLISECOND
     * @see TimeFormat#ROUND_TO_SECOND
     * @see TimeFormat#ROUND_TO_MINUTE
     * @see TimeFormat#ROUND_TO_HOUR
     * @see TimeFormat#ROUND_TO_DAY
     */
    public void setRounding(int r)
    {
        rounding = r;
    }

    /**
     * return the currently set rounding
     *
     * @return rounding
     * @see TimeFormat#ROUND_TO_MILLISECOND
     * @see TimeFormat#ROUND_TO_SECOND
     * @see TimeFormat#ROUND_TO_MINUTE
     * @see TimeFormat#ROUND_TO_HOUR
     * @see TimeFormat#ROUND_TO_DAY
     */
    public int getRouding()
    {
        return rounding;
    }

    /**
     * format string based on rouding
     *
     * @param round rounding
     * @return rounded value as string
     * @see TimeFormat#ROUND_TO_MILLISECOND
     * @see TimeFormat#ROUND_TO_SECOND
     * @see TimeFormat#ROUND_TO_MINUTE
     * @see TimeFormat#ROUND_TO_HOUR
     * @see TimeFormat#ROUND_TO_DAY
     */
    public String format(int round)
    {

        if (DEBUG)
        {
            System.err.println("-->time: " + time + ", round: " + round + ", micro: " + micro + ",remainder:"
                               + remainder);
            System.err.println("-->days: " + days);
            System.err.println("-->hours: " + hours);
            System.err.println("-->minutes: " + minutes);
            System.err.println("-->hours: " + hours);
            System.err.println("-->seconds: " + seconds);
            System.err.println("-->milliseconds: " + milliseconds);
            System.err.flush();
        }

        switch (round)
        {

            case ROUND_TO_DAY:
            {
                return formatDays(false);
            }

            case ROUND_TO_HOUR:
            {
                return formatDays(true) + formatHours(false);
            }

            case ROUND_TO_MINUTE:
            {
                return formatDays(true) + formatHours(true) + formatMinutes(false);
            }

            case ROUND_TO_SECOND:
            {
                return formatDays(true) + formatHours(true) + formatMinutes(true) + formatSeconds(false);
            }

            case ROUND_TO_MILLISECOND:
            {
                return formatDays(true) + formatHours(true) + formatMinutes(true) + formatSeconds(true)
                       + (micro ? time : milliseconds) + " ms";
            }
        }

        return original + " ms";
    }

    /**
     * format days as a string value
     *
     * @param empty if <code>true</code> returns empty string if no days, otherwise if <code>false</code> will return 0 days if no days
     * @return formatted days as string ala 1 day or 5 days
     */
    private String formatDays(boolean empty)
    {
        if (days <= 0)
        {
            return empty ? "" : "0 days";
        }

        return format("day", "days", days);
    }

    /**
     * format hours as a string value
     *
     * @param empty if <code>true</code> returns empty string if no hours, otherwise if <code>false</code> will return 0 hours if no hours
     * @return formatted hours as string ala 1 hour or 5 hours
     */
    private String formatHours(boolean empty)
    {
        if (hours <= 0)
        {
            return empty ? "" : "0 hours";
        }

        return format("hour", "hours", hours);
    }

    /**
     * format minutes as a string value
     *
     * @param empty if <code>true</code> returns empty string if no minutes, otherwise if <code>false</code> will return 0 minutes if no minutes
     * @return formatted minutes as string ala 1 minute or 5 minutes
     */
    private String formatMinutes(boolean empty)
    {
        if (minutes <= 0)
        {
            return empty ? "" : "0 minutes";
        }

        return format("minute", "minutes", minutes);
    }

    /**
     * format seconds as a string value
     *
     * @param empty if <code>true</code> returns empty string if no seconds, otherwise if <code>false</code> will return 0 seconds if no seconds
     * @return formatted seconds as string ala 1 second or 5 seconds
     */
    private String formatSeconds(boolean empty)
    {
        if (seconds <= 0)
        {
            return empty ? "" : "0 seconds";
        }

        return format("second", "seconds", seconds);
    }

    /**
     * handle amount formatting
     *
     * @param single single string value
     * @param plural plural string value
     * @param amt    amount
     * @return formatted amount as string
     */
    private String format(String single, String plural, long amt)
    {
        if (amt > 0)
        {
            return amt + " " + (amt > 1 ? plural : single) + " ";
        }

        return "";
    }

    /**
     * return a string formatted version of time <code>t</code>
     * rounding to <code>round</code>
     *
     * @param t     time
     * @param round rounding value
     * @return String formatted time value
     * @see TimeFormat#ROUND_TO_MILLISECOND
     * @see TimeFormat#ROUND_TO_SECOND
     * @see TimeFormat#ROUND_TO_MINUTE
     * @see TimeFormat#ROUND_TO_HOUR
     * @see TimeFormat#ROUND_TO_DAY
     */
    public static String valueOf(long t, int round)
    {
        TimeFormat f = new TimeFormat(t, round);

        return f.toString();
    }

    /**
     * return a string formatted version of time <code>t</code>
     * rounding to the millisecond
     *
     * @param t time
     * @return String value
     */
    public static String valueOf(long t)
    {
        return valueOf(t, TimeFormat.ROUND_TO_MILLISECOND);
    }

    /**
     * format time with specified format
     *
     * @param format time format
     * @param time   time to format
     * @return formatted time
     */
    public static String format(String format, long time)
    {
        TimeFormat f = new TimeFormat(time);

        return f.parse(format, f.getDays(), f.getHours(), f.getMinutes(), f.getSeconds(), f.getMilliseconds());

    }

    /**
     * parse the specified values according to the specified format and return formatted string
     *
     * @param format time format
     * @param day    days
     * @param hour   hours
     * @param minute minutes
     * @param second seconds
     * @param millis milliseconds
     * @return string with values formatted accordingly
     */
    private String parse(String format, long day, long hour, long minute, long second, long millis)
    {
        String s = "";
        int start = 0;
        int len = format.length();

        for (int c = 0; c < len; c++)
        {
            char tc = format.charAt(c);
            int sc = c;
            int l;

            switch (tc)
            {

                case' ':
                {
                    s += " ";

                    break;
                }

                case'\'':
                {
                    while (++c < len && format.charAt(c) != '\'') ;

                    s += format.substring(sc + 1, c);

                    break;
                }

                case'D':     // days

                case'd':
                    while (++c < len && (format.charAt(c) == 'd' || format.charAt(c) == 'D')) ;

                    l = c - sc;
                    s += sc <= 0 || start < 0 ? "" : format.substring(start, sc);
                    s += zeroPad(day, l - 1);
                    --c;

                    break;

                case'h':     // hours

                case'H':
                    while (++c < len && (format.charAt(c) == 'h' || format.charAt(c) == 'H')) ;

                    l = c - sc;
                    s += sc <= 0 || start < 0 ? "" : format.substring(start, sc);
                    s += zeroPad(hour, l - 1);
                    --c;

                    break;

                case'm':     // minutes

                case'M':
                    while (++c < len && (format.charAt(c) == 'm' || format.charAt(c) == 'M')) ;

                    l = c - sc;
                    s += sc <= 0 || start < 0 ? "" : format.substring(start, sc);
                    s += zeroPad(minute, l - 1);
                    --c;

                    break;

                case's':     // seconds

                case'S':
                    while (++c < len && (format.charAt(c) == 's' || format.charAt(c) == 'S')) ;

                    l = c - sc;
                    s += sc <= 0 || start < 0 ? "" : format.substring(start, sc);
                    s += zeroPad(second, l - 1);
                    --c;

                    break;

                case'z':     // milliseconds

                case'Z':
                    while (++c < len && (format.charAt(c) == 'z' || format.charAt(c) == 'Z')) ;

                    l = c - sc;
                    s += sc <= 0 || start < 0 ? "" : format.substring(start, sc);
                    s += zeroPad(millis, l - 1);
                    --c;

                    break;
            }

            start = c + 1;
        }

        return s;
    }

    /**
     * zero pad a number to len
     *
     * @param value value to pad
     * @param len   length of number
     * @return number zero padded if not already at length
     */
    private String zeroPad(long value, int len)
    {
        String s = String.valueOf(value);
        int l = s.length();
        String r = "";

        for (int c = l; c <= len; c++)
        {
            r += "0";
        }

        return r + s;
    }

    /**
     * test
     *
     * @param args unused
     */
    public static void main(String args[])
    {
        String FORMAT = "D 'days,' HH 'hours,' mm 'minutes and ' ss 'seconds, 'zz 'milliseconds'";

        System.out.println(TimeFormat.format(FORMAT, 1000));
        System.out.println("ONE SECOND: " + TimeFormat.ONE_SECOND);
        System.out.println("ONE MINUTE: " + TimeFormat.ONE_MINUTE);
        System.out.println("ONE HOUR:   " + TimeFormat.ONE_HOUR);
        System.out.println("ONE DAY:    " + TimeFormat.ONE_DAY);

        for (int c = 0; c <= 5; c++)
        {
            System.out.println("============ Round to: " + c + " ==================");
            System.out.println("Time: " + TimeFormat.valueOf(Long.MAX_VALUE, c));
            System.out.println("Time: " + TimeFormat.valueOf(1236371400, c));
            System.out.println("Time: " + TimeFormat.format(FORMAT, 1236371400));
            System.out.println("Time: " + TimeFormat.valueOf(123613700, c));
            System.out.println("Time: " + TimeFormat.valueOf(700, c));
            System.out.println("Time: " + TimeFormat.valueOf(2001, c));
            System.out.println("Time: " + TimeFormat.valueOf(2101, c));
            System.out.println("Time: " + TimeFormat.valueOf(15, c));
            System.out.println("Time: " + TimeFormat.valueOf(999, c));
            System.out.println("Time: " + TimeFormat.valueOf(10000, c));
            System.out.println("Time: " + TimeFormat.valueOf(ONE_MINUTE * 10, c));
            System.out.println("Time: " + TimeFormat.valueOf(ONE_DAY * 10 + 101, c));
            System.out.println("Time: " + TimeFormat.valueOf(ONE_HOUR * 10, c));
            System.out.println("Time: " + TimeFormat.valueOf(ONE_HOUR + ONE_DAY + (ONE_MINUTE * 2), c));
            System.out.println("Time: " + TimeFormat.format(FORMAT, ONE_HOUR + ONE_DAY + (ONE_MINUTE * 2)));
            System.out.println("================================================");
        }
    }

}
