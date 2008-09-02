
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
