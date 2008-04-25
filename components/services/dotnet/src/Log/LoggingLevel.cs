/*
 * Author Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;

namespace Appcelerator
{
    /// <summary>
    /// Level to log.  We'll eventually make this configurable using an xml file...
    /// </summary>
    public enum LoggingLevel
    {
        INFO = 0,
        WARN = 1,
        ERROR = 2,
        DEBUG = 3
    }
}