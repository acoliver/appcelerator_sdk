/*
 * Author Amro Mousa
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

        public Message(XPathNavigator msgXML, HttpSessionState session, ServiceBroker servicebroker, RequestDetails details)
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(msgXML.OuterXml);
            XmlElement msg = doc.DocumentElement;
            requestid = msg.GetAttribute("requestid");
            type = msg.GetAttribute("type").ToLower();
            scope = msg.GetAttribute("scope");
            version = msg.GetAttribute("version");
            sessionid = session.SessionID;
            json = parseMessagePayload(msg.InnerText);
            requestdetails = details;
            this.session = session;
            this.servicebroker = servicebroker;
        }

        public Message(JsonObject message, HttpSessionState session, ServiceBroker servicebroker, RequestDetails details)
        {
            type = ((JsonString)message["type"]).Value;
            scope = ((JsonString)message["scope"]).Value;
            version = ((JsonString)message["version"]).Value;
            json = (JsonObject)message["data"];
            sessionid = session.SessionID;
            requestdetails = details;
            this.session = session;
            this.servicebroker = servicebroker;
        }


        public Message(HttpSessionState session, ServiceBroker servicebroker)
        {
            this.session = session;
            this.servicebroker = servicebroker;
            sessionid = session.SessionID;
			json = new JsonObject();
        }

        private JsonObject parseMessagePayload(String messagePayload)
        {
            JsonParser parser = new JsonParser(new StringReader(messagePayload), true);
            return parser.ParseObject();
        }

        public String GetMessageXML()
        {
            String xml = "<message direction='"+direction.ToString()+"' type='"+type+"' datatype='"+dataType.ToString()+"' scope='"+scope+"' version='"+version+"'>";
            xml += "<![CDATA[" + Payload + "]]>";
            xml += "</message>";
            return xml;
        }

        public string GetMessageJSON()
        {
            /*
              Message schema:
                  type: the message type
                  version: the version of the service to access
                  scope: the scope of this message
                  requestid: the id of this request
                  data: a JSON object containing the data payload
             */
            String json = "{type:'"+type+"',version:'"+version+"',scope:'"+scope+"',data:";
            json += Payload;
            json += "}";
            return json;
        }

        public String Type
        {
            get { return type; }
            set { type = value.ToLower(); }
        }

        public String Payload
        {
            get 
            { 
                using (JsonWriter writer = new JsonWriter())
                {
	                Data.Write(writer);
	                return writer.ToString();
                }
            }
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

        public String Version
        {
            get { return version; }
            set { version = value;  }
        }

        public String Scope
        {
            get { return scope; }
            set { scope = value; }
        }

        public RequestDetails RequestDetails
        {
            get { return requestdetails; }
            set { requestdetails = value; }
        }
    }
}
