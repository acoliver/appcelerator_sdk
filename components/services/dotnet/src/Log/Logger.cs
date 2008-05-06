/*
 * Author Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.SessionState;
using Appcelerator;
using System.IO;
using System.Xml;
using System.Xml.XPath;
using System.Configuration;

namespace Appcelerator
{
    class Logger
    {
        private static readonly Logger instance = new Logger();
        private static LoggingLevel loggingLevel = LoggingLevel.ERROR;
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

            if (logLevel <= this.LoggingLevel)
            {
                String timestamp = "[" + level + " | " + DateTime.Now.ToString("M/d/yyyy HH:mm:ss") + "] ";
                writer.WriteLine(timestamp + logMessage);
            }
        }

        public void Info(String logMessage)
        {
            Log(LoggingLevel.INFO, logMessage);
        }

        public void Warn(String logMessage)
        {
            Log(LoggingLevel.WARN, logMessage);
        }

        public void Error(String logMessage)
        {
            Log(LoggingLevel.ERROR, logMessage);
        }

        public void Debug(String logMessage)
        {
            Log(LoggingLevel.DEBUG, logMessage);
        }

        private static void setupLogFile()
        {
            try
            {                
                //APPSDK-403: Read the logging settings from the ConfigurationManager (which reads them from web.config)
                String logFileLocation = ConfigurationManager.AppSettings["LogLocation"];
                String logLevelSetting = ConfigurationManager.AppSettings["LogLevel"];
                String autoFlushSetting = ConfigurationManager.AppSettings["AutoFlushLog"];            

                //Set append to true so we automatically create a new file when needed but append otherwise
                writer = new StreamWriter(logFileLocation, true);

                bool autoflush = false;
                try
                {
                    autoflush = Boolean.Parse(autoFlushSetting);
                }
                catch { autoflush = false; }
                writer.AutoFlush = autoflush;

                try
                {
                    Logger.Instance.LoggingLevel = StringToLoggingLevel(logLevelSetting);
                }
                catch { Logger.Instance.LoggingLevel = LoggingLevel.ERROR; }
            }
            catch 
            {
                //If we can't open the settings file
                Logger.Instance.LoggingLevel = LoggingLevel.ERROR;
                writer.AutoFlush = true;
            }
        }

        public void forceWrite(String s)
        {
            writer.WriteLine(s);
            writer.Flush();
        }

        private static LoggingLevel StringToLoggingLevel(string level)
        {
            LoggingLevel levelToUse;

            switch (level.ToUpper())
            {
                case "DEBUG":
                    levelToUse = LoggingLevel.DEBUG;
                    break;
                case "ERROR":
                    levelToUse = LoggingLevel.ERROR;
                    break;
                case "WARN":
                    levelToUse = LoggingLevel.WARN;
                    break;
                case "INFO":
                    levelToUse = LoggingLevel.INFO;
                    break;
                default:
                    levelToUse = LoggingLevel.ERROR;
                    break;
            }

            return levelToUse;
        }
    }
}
