/*
 * Author Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.Xml.XPath;
using System.IO;
using NetServ.Net.Json;

namespace Appcelerator
{
    public class RequestDetails
    {
        //Old XML-wrapped json protocol
        private String timestamp="";
        private String idle="";
        private String tz="";

        //New JSON-only protocol
        private String time="";
        private String encoding="";
        private String sessionid="";

        //Both
        private String version="";


        public RequestDetails(Stream request_data, String content_type)
        {
            switch (content_type)
            {
                case ServiceBroker.APPLICATION_JSON:
                    using (StreamReader request_reader = new StreamReader(request_data))
                    {
                        StringReader requestJSON = new StringReader(request_reader.ReadToEnd());
                        JsonParser parser = new JsonParser(requestJSON,true);
                        JsonObject json = parser.ParseObject();
                        time = ((JsonString)json["time"]).Value;
                        encoding = ((JsonString)json["encoding"]).Value;
                        sessionid = ((JsonString)json["sessionid"]).Value;
                        version = ((JsonString)json["version"]).Value;
                    }
                    break;
                case ServiceBroker.XML_JSON:
                    XPathDocument requestXML = new XPathDocument(request_data);
                    XmlDocument doc = new XmlDocument();
                    doc.LoadXml(requestXML.CreateNavigator().OuterXml);
                    XmlElement request = doc.DocumentElement;

                    timestamp = request.GetAttribute("timestamp");
                    idle = request.GetAttribute("idle");
                    tz = request.GetAttribute("tz");
                    version = request.GetAttribute("version");
                    break;
            }
        }

        public String Timestamp
        {
            get { return timestamp; }
            set { timestamp = value; }
        }

        public String Idle
        {
            get { return timestamp; }
            set { idle = value; }
        }

        public String Timezone
        {
            get { return tz; }
            set { tz = value; }
        }

        public String Version
        {
            get { return version; }
            set { version = value; }
        }

        private String Time
        {
            get { return time; }
            set { time = value; }
        }
        private String Encoding
        {
            get { return encoding; }
            set { encoding = value; }
        }
        private String SessionId
        {
            get { return sessionid; }
            set { sessionid = value; }
        }
    }
}
