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

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.TimeZone;

import org.apache.log4j.Logger;

/**
 * DateUtil is a utility class to help with various date manipulation tasks.
 *
 * @author <a href="mailto:jhaynie@hakano.com">Jeff Haynie</a>
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class DateUtil
{
    private static final Logger LOG = Logger.getLogger(DateUtil.class);

    public static final String MONTHS[] = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

    /**
     * gets the 3 character month string from the given calendar
     *
     * @param c calendar
     * @return 3 character month
     */
    public static String getMonth(Calendar c)
    {
        return MONTHS[c.get(Calendar.MONTH)];
    }

    /**
     * SimpleDateFormat in ATOM format.
     */
    public static final SimpleDateFormat ATOM_DATE_FORMAT = new SimpleDateFormat("EEE' 'MMM' 'dd' 'HH:mm:ss' 'Z' 'yyyy");
    /**
     * SimpleDateFormat in ISO 8601 format.
     */
    public static final SimpleDateFormat ISO8601_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
    /**
     * SimpleDateFormat in RFC 822 format.
     */
    public static final SimpleDateFormat RFC822_DATE_FORMAT = new SimpleDateFormat("EEE', 'dd' 'MMM' 'yyyy' 'HH:mm:ss' 'Z", Locale.US);
    /**
     * SimpleDateFormat in Java date format.
     */
    public static final SimpleDateFormat JAVA_DATE_FORMAT = new SimpleDateFormat("EEE' 'MMM' 'dd' 'HH:mm:ss' 'zzz' 'yyyy");
    /**
     * SimpleDateFormat in appcelerator format.
     */
    public static final SimpleDateFormat APP_DATE_FORMAT = new SimpleDateFormat("yyyy/MM/dd' 'HH:mm:ss.SSS");
    /**
     * SimpleDateFormat in HH:mm:ss time only format.
     */
    public static final SimpleDateFormat TIME_DATE_FORMAT = new SimpleDateFormat("HH:mm:ss");
    /**
     * Greenwich mean time timezone (GMT).
     */
    public static final TimeZone GMT_TZ = TimeZone.getTimeZone("GMT");

    static
    {
        ISO8601_DATE_FORMAT.setTimeZone(GMT_TZ);
        RFC822_DATE_FORMAT.setTimeZone(GMT_TZ);
        JAVA_DATE_FORMAT.setTimeZone(TimeZone.getDefault());
        APP_DATE_FORMAT.setTimeZone(TimeZone.getDefault());
    }

    /**
     * get the specified date as a string in appcelerator date format
     *
     * @param date date to get
     * @return string date in appcelerator date format.
     * @see DateUtil#APPCELERATOR_DATE_FORMAT
     */
    public static String getDateAsAppFormat(Date date)
    {
        if (null == date)
        {
            return null;
        }

        synchronized (APP_DATE_FORMAT)
        {
            return APP_DATE_FORMAT.format(date);
        }
    }

    /**
     * get the specified date as a string in simple time date format
     *
     * @param date date to get
     * @return string date in simple time date format.
     * @see DateUtil#TIME_DATE_FORMAT
     */
    public static String getDateAsTimeFormat(Date date)
    {
        if (null == date)
        {
            return null;
        }

        synchronized (TIME_DATE_FORMAT)
        {
            return TIME_DATE_FORMAT.format(date);
        }
    }

    /**
     * get the specified date as a string in RFC 822 date format
     *
     * @param date date to get
     * @return string date in RFC 822 date format.
     * @see DateUtil#RFC822_DATE_FORMAT
     */
    public static String getDateAsRFC822(Date date)
    {
        if (null == date)
        {
            return null;
        }

        synchronized (RFC822_DATE_FORMAT)
        {
            return RFC822_DATE_FORMAT.format(date);
        }
    }

    /**
     * get the specified date as a string in java date format
     *
     * @param date date to get
     * @return string date in java date format.
     * @see DateUtil#JAVA_DATE_FORMAT
     */
    public static String getDateAsJavaDate(Date date)
    {
        if (null == date)
        {
            return null;
        }

        synchronized (JAVA_DATE_FORMAT)
        {
            return JAVA_DATE_FORMAT.format(date);
        }
    }

    /**
     * get the specified date as a string in ISO 8601 date format
     *
     * @param date date to get
     * @return string date in IOS 8601 date format.
     * @see DateUtil#ISO8601_DATE_FORMAT
     */
    public static String getDateAsISO8601(Date date)
    {
        if (null == date)
        {
            return null;
        }

        synchronized (ISO8601_DATE_FORMAT)
        {
            String result = ISO8601_DATE_FORMAT.format(date);
            //convert YYYYMMDDTHH:mm:ss+HH00 into YYYYMMDDTHH:mm:ss+HH:00
            //- note the added colon for the Timezone
            result = result.substring(0, result.length() - 2)
                     + ":" + result.substring(result.length() - 2);
            return result;
        }
    }

    /**
     * attempts to parse the string date in known formats
     *
     * @param str date string to parse
     * @return calendar for parsed date or <code>null</code> if not successful
     */
    public static Calendar parseDate(String str)
    {
        if (str == null || str.length() == 0)
        {
            return null;
        }
        Date date;
        Calendar cal = null;
        try
        {
            synchronized (ISO8601_DATE_FORMAT)
            {
                date = ISO8601_DATE_FORMAT.parse(str);
            }
        }
        catch (Exception ex)
        {
            try
            {
                synchronized (RFC822_DATE_FORMAT)
                {
                    date = RFC822_DATE_FORMAT.parse(str);
                }
            }
            catch (Exception ex2)
            {
                try
                {
                    synchronized (ATOM_DATE_FORMAT)
                    {
                        date = ATOM_DATE_FORMAT.parse(str);
                    }
                }
                catch (Exception ex3)
                {
                    try
                    {
                        synchronized (APP_DATE_FORMAT)
                        {
                            date = APP_DATE_FORMAT.parse(str);
                        }
                    }
                    catch (ParseException ex1)
                    {
                        // last resort, try our common date formats
                        date = parseUsingCommonDateFormats(str);
                    }
                }
            }
        }
        if (date != null)
        {
            cal = new GregorianCalendar();
            cal.setTime(date);
            cal.setTimeZone(GMT_TZ);
        }
        else
        {
            LOG.error("couldn't parse date: " + str, new Exception());
        }
        return cal;
    }

    /**
     * array of common date formats
     */
    private static final SimpleDateFormat COMMON_DATE_FORMATS[] = {
            new SimpleDateFormat("EEE' 'dd' 'MMM' 'yyyy' 'HH:mm:ss' 'ZZZZ"),
            new SimpleDateFormat("EEE MMM dd HH:mm:ss yyyy"),
            new SimpleDateFormat("EEE MMM dd HH:mm:ss yyyy zzz"),
            new SimpleDateFormat("EEE, MMM dd HH:mm:ss yyyy zzz"),
            new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz"),
            new SimpleDateFormat("EEE,dd MMM yyyy HH:mm:ss zzz"),
            new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:sszzz"),
            new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss"),
            new SimpleDateFormat("EEE, dd-MMM-yy HH:mm:ss zzz"),
            new SimpleDateFormat("yyyy/MM/dd HH:mm:ss.SSS zzz"),
            new SimpleDateFormat("yyyy/MM/dd HH:mm:ss.SSS"),
            new SimpleDateFormat("yyyy/MM/dd HH:mm:ss zzz"),
            new SimpleDateFormat("yyyy/MM/dd"),
            new SimpleDateFormat("yyyy.MM.dd HH:mm:ss"),
            new SimpleDateFormat("yyyy-MM-dd HH:mm"),
            new SimpleDateFormat("MM/dd/yyyy"),
            new SimpleDateFormat("MMM dd yyyy HH:mm:ss. zzz"),
            new SimpleDateFormat("MMM dd yyyy HH:mm:ss zzz"),
            new SimpleDateFormat("dd.MM.yyyy HH:mm:ss zzz"),
            new SimpleDateFormat("dd MM yyyy HH:mm:ss zzz"),
            new SimpleDateFormat("dd.MM.yyyy; HH:mm:ss"),
            new SimpleDateFormat("dd.MM.yyyy HH:mm:ss"),
            new SimpleDateFormat("dd.MM.yyyy zzz")
    };

    /**
     * attempt to parse using common date formats
     *
     * @param d string date to parse
     * @return date or <code>null</code> if unable to parse
     * @see DateUtil#COMMON_DATE_FORMATS
     */
    public static java.util.Date parseUsingCommonDateFormats(String d)
    {
        for (SimpleDateFormat f : COMMON_DATE_FORMATS)
        {
            try
            {
                synchronized (f)
                {
                    return f.parse(d);
                }
            }
            catch (Exception ex)
            {
                if (LOG.isDebugEnabled()) LOG.debug("incompatible common date format " + f + " for date " + d);
            }
        }
        // sometimes, the timezone causes a problem such as 
        // -800 instead of -0800 - try to check for that
        // Apple's ITune RSS feed is a good example of bad dates/timezones
        int idx = d.lastIndexOf('-');
        if (idx > 0)
        {
            String tz = d.substring(idx + 1);
            if (tz.length() < 4)
            {
                // pad with a the 0 to correct the timezone
                String newDate = d.substring(0, idx) + "-0" + tz;
                return parseUsingCommonDateFormats(newDate);
            }
        }
        return null;
    }

    /**
     * compares two datess down to the second
     *
     * @param date1 first date
     * @param date2 second date
     * @return <code>true</code> if the dates equal to the second, <code>false</code> otherwise
     */
    public static boolean datesEqualToSecond(Date date1, Date date2)
    {
        Calendar calendar1 = new GregorianCalendar(GMT_TZ);
        calendar1.setTime(date1);
        Calendar calendar2 = new GregorianCalendar(GMT_TZ);
        calendar2.setTime(date2);

        if (calendar1.get(Calendar.YEAR) == calendar2.get(Calendar.YEAR))
        {
            if (calendar1.get(Calendar.DAY_OF_YEAR) == calendar2.get(Calendar.DAY_OF_YEAR))
            {
                if (calendar1.get(Calendar.HOUR) == calendar2.get(Calendar.HOUR))
                {
                    if (calendar1.get(Calendar.MINUTE) == calendar2.get(Calendar.MINUTE))
                    {
                        if (calendar1.get(Calendar.SECOND) == calendar2.get(Calendar.SECOND))
                        {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * given a date, return the beginning hour/minute/second of the day (basically, just after midnight)
     *
     * @param date date to determine beginning of day
     * @return beginning of day as date
     */
    public static Date getBeginningOfDay(Date date)
    {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    /**
     * given a date and an hour (+/-) return the exact hour with minute/second/ms at 0.  pass in a negative
     * number of go back a number of hours from date or positive to go forward.
     *
     * @param date  date to determine beginning of day
     * @param hours hours to adjust (plus or minus)
     * @return beginning of day as date (plus or minus specified hours)
     */
    public static Date getBeginningHourOfDay(Date date, int hours)
    {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.HOUR_OF_DAY, calendar.get(Calendar.HOUR_OF_DAY) + hours);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    /**
     * creates a date for sql with ms always at 0.
     *
     * @param date date to create sql date from.
     * @return sql date
     */
    public static Date createSqlDate(Date date)
    {
        if (null == date)
        {
            return date;
        }

        long timeInMillis = date.getTime();
        timeInMillis -= timeInMillis % 1000;
        return new Date(timeInMillis);
    }
    
    /**
     * returns true if the date passed in is today (regardless of time)
     * 
     * @param date
     * @return
     */
    public static boolean isToday (Date date)
    {
    	Calendar now = Calendar.getInstance();
    	Calendar then = Calendar.getInstance();
    	then.setTime(date);
    	return now.get(Calendar.DATE) == then.get(Calendar.DATE) &&
    		   now.get(Calendar.YEAR) == then.get(Calendar.YEAR) &&
    	       now.get(Calendar.MONTH) == then.get(Calendar.MONTH);
    }

    /**
     * gets today as a date
     *
     * @return today as date
     */
    public static Date today()
    {
        Calendar calendar = new GregorianCalendar(GMT_TZ);
        calendar.setTime(new Date());

        Calendar today = new GregorianCalendar(GMT_TZ);
        today.clear();
        today.set(calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DATE));
        return today.getTime();
    }

    /**
     * gets tomorrow as a date
     *
     * @return tomorrow
     */
    public static Date tommorow()
    {
        Calendar calendar = new GregorianCalendar(GMT_TZ);
        calendar.setTime(new Date());

        Calendar tommorow = new GregorianCalendar(GMT_TZ);
        tommorow.clear();
        tommorow.set(calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DATE));
        tommorow.add(Calendar.DATE, 1);
        return tommorow.getTime();
    }

    /**
     * gets now as a date
     *
     * @return now
     */
    public static Date now()
    {
        return createSqlDate(new Date());
    }
}
