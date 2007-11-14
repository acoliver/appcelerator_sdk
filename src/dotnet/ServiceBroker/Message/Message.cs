/*
 * Author: Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Web.SessionState;
using System.Xml;
using System.Xml.XPath;
using NetServ.Net.Json;
using System.IO;

namespace Appcelerator
{
    public class Message
    {
        private String requestid;
        private String type;
        private String scope;
        private String version;
        private JsonObject json;
        private HttpSessionState session;
        private String sessionid;
        private MessageDirection direction;
        private MessageDataType dataType = MessageDataType.JSON;
        private RequestDetails requestdetails;

        private String instanceid;

        private ServiceBroker servicebroker;

        public Message(String msgXML, HttpSessionState session, ServiceBroker servicebroker, RequestDetails details)
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(msgXML);
            XmlElement msg = doc.DocumentElement;
            requestid = msg.GetAttribute("requestid");
            type = msg.GetAttribute("type");
            scope = msg.GetAttribute("scope");
            version = msg.GetAttribute("scope");
            sessionid = session.SessionID;
            json = parseMessagePayload(msg.InnerText);
            requestdetails = details;
            this.session = session;
            this.servicebroker = servicebroker;
        }

        public Message(HttpSessionState session, ServiceBroker servicebroker)
        {
            this.session = session;
            this.servicebroker = servicebroker;
            sessionid = session.SessionID;
        }

        private JsonObject parseMessagePayload(String messagePayload)
        {
            JsonParser parser = new JsonParser(new StringReader(messagePayload), true);
            return parser.ParseObject();
        }

        public String GetMessageXML()
        {
            String xml = "";

            xml += "<message direction="+direction.ToString()+" type="+type+" datatype="+dataType.ToString()+" scope="+scope+" version="+version+">";
            xml += "<![CDATA[" + Payload + "]";
            xml += "</message>";
            return xml;
        }

        public String Type
        {
            get { return type; }
            set { type = value; }
        }

        public String Payload
        {
            get { return (Data != null) ? Data.ToString() : ""; }
            set { Data = parseMessagePayload(value); }
        }

        public MessageDirection Direction
        {
            get { return direction; }
            set { direction = value; }
        }

        public JsonObject Data
        {
            get { return json; }
            set { json = value; }
        }

        public ServiceBroker ServiceBroker
        {
            get { return servicebroker; }
        }

        public RequestDetails RequestDetails
        {
            get { return requestdetails; }
            set { requestdetails = value; }
        }
    }
}
