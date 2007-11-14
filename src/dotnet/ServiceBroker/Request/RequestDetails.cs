using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace Appcelerator
{
    public class RequestDetails
    {
        private String timestamp;
        private String idle;
        private String tz;
        private String version;

        public RequestDetails(String requestXML)
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(requestXML);
            XmlElement request = doc.DocumentElement;
            timestamp = request.GetAttribute("timestamp");
            idle = request.GetAttribute("idle");
            tz = request.GetAttribute("tz");
            version = request.GetAttribute("version");
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
    }
}
