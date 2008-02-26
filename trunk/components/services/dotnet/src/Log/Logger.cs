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
using System.Xml;
using System.Xml.XPath;

namespace Appcelerator
{
    sealed class Logger
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
            String bin = AppDomain.CurrentDomain.BaseDirectory + @"\bin";
            String logFileLocation = bin + @"\appcelerator.log";
            String xmlsettingsFileLocation = bin + @"\appcelerator-config.xml";

            //Set append to true so we automatically create a new file when needed but append otherwise
            writer = new StreamWriter(logFileLocation, true);

            try
            {
                XmlDocument settings = new XmlDocument();
                settings.Load(xmlsettingsFileLocation);

                XPathNodeIterator autoIter = settings.CreateNavigator().Select("//logger/autoflush");
                XPathNodeIterator loglevelIter = settings.CreateNavigator().Select("//logger/loglevel");
                autoIter.MoveNext();
                loglevelIter.MoveNext();

                bool autoflush = false;
                try
                {
                    autoflush = autoIter.Current.ValueAsBoolean;
                }
                catch { autoflush = false; }
                writer.AutoFlush = autoflush;

                try
                {
                    Logger.Instance.LoggingLevel = StringToLoggingLevel(loglevelIter.Current.Value);
                }
                catch { Logger.Instance.LoggingLevel = LoggingLevel.ERROR; }
            }
            catch 
            {
                //If we can't open the settings file
                Logger.Instance.LoggingLevel = LoggingLevel.ERROR;
                writer.AutoFlush = false;
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
