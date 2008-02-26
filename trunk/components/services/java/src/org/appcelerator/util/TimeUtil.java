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
package org.appcelerator.util;


/**
 * TimeUtil is a collecction of time utility functions.
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class TimeUtil
{
    public static final long ONE_SECOND = 1000;
    public static final long ONE_MINUTE = ONE_SECOND * 60;
    public static final long ONE_HOUR = ONE_MINUTE * 60;
    public static final long ONE_DAY = ONE_HOUR * 24;
    public static final long ONE_YEAR = ONE_DAY * 365;

    /**
     * gets the long time from the specified string
     *
     * @param time time as string
     * @return time in milliseconds
     */
    public static long getTime(String time)
    {
        int len = time.length();
        long value = 0;
        String placeholder = "";
        boolean mPending = false;
        for (int c = 0; c < len; c++)
        {
            char ch = time.charAt(c);

            if (ch == ' ')
            {
                continue;
            }

            if (mPending && ch != 's')
            {
                mPending = false;
                value += Integer.parseInt(placeholder) * ONE_MINUTE;
                placeholder = "";
            }

            switch (ch)
            {
                case'm':
                {
                    mPending = true;
                    continue;
                }

                case's':
                {
                    if (mPending)
                    {
                        // is a millisecond
                        mPending = false;
                        value += Integer.parseInt(placeholder);
                        placeholder = "";
                        continue;
                    }
                    else
                    {
                        // sec
                        value += Integer.parseInt(placeholder) * ONE_SECOND;
                        placeholder = "";
                        continue;
                    }
                }

                case'h':
                {
                    value += Integer.parseInt(placeholder) * ONE_HOUR;
                    placeholder = "";
                    continue;
                }

                case'd':
                {
                    value += Integer.parseInt(placeholder) * ONE_DAY;
                    placeholder = "";
                    continue;
                }

                case'y':
                {
                    value += Integer.parseInt(placeholder) * ONE_YEAR;
                    placeholder = "";
                    continue;
                }

                default:
                {
                    placeholder += String.valueOf(ch);
                }
            }
        }
        if (!placeholder.equals(""))
        {
            if (mPending)
            {
                value += Integer.parseInt(placeholder) * ONE_MINUTE;
            }
            else
            {
                value += Integer.parseInt(placeholder);
            }
        }
        return value;
    }
}
