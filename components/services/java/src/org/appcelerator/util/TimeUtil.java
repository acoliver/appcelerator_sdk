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
