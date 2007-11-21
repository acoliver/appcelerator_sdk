/*
 * Autho Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.SessionState;
using Appcelerator;
using System.IO;

namespace Appcelerator
{
    sealed class Logger
    {
        private static readonly Logger instance = new Logger();
        private static LoggingLevel loggingLevel = LoggingLevel.DEBUG;
        private static StreamWriter writer;
        static readonly object padlock = new object();

        static Logger() { setupLogFile(); }
        Logger() {}
        
        public static Logger Instance
        {
            get { return instance; }
        }

        public LoggingLevel LoggingLevel
        {
            get { return loggingLevel; }
            set { loggingLevel = value; }
        }

        public void Log(LoggingLevel logLevel, String logMessage)
        {
            if (writer == null) setupLogFile();
            String level = logLevel.ToString();
            if (loggingLevel <= this.LoggingLevel)
            {
                String timestamp = "[" + level + " | " + DateTime.Now.ToString("M/d/yyyy HH:mm:ss") + "] ";
                writer.WriteLine(timestamp + logMessage);
            }
        }

        private static void setupLogFile()
        {
            String logFileLocation = AppDomain.CurrentDomain.BaseDirectory + @"\bin\appcelerator.log";

            //Set append to true so we automatically create a new file when needed but append otherwise
            writer = new StreamWriter(logFileLocation, true);
            writer.AutoFlush = true;
        }
    }
}
