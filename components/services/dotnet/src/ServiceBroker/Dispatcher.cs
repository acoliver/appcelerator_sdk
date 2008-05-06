/*
 * Author Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.SessionState;
using System.Globalization;

namespace Appcelerator
{
    sealed class Dispatcher
    {
        public Dictionary<string, Queue<Message>> id_queue = new Dictionary<string, Queue<Message>>();
        private static readonly Dispatcher instance = new Dispatcher();
        static readonly object padlock = new object();


        static Dispatcher() { }
        Dispatcher() { }

        public static Dispatcher Instance
        {
            get { return instance; }
        }

        //Sends messages to Services -- called from the ServiceBroker
        public void Dispatch(List<Message> messageList, ServiceManager manager, HttpRequest httprequest, HttpResponse httpresponse, HttpSessionState session, ServiceBroker broker)
        {
            Logger.Instance.Debug("Dispatching " + messageList.Count + " message(s) for Session ID: " + session.SessionID);

            foreach (Message request in messageList)
            {
                Message response = new Message(session, broker);
                response.Direction = MessageDirection.OUTGOING;
                manager.HandleRequest(request, response, session, httpresponse);
            }
        }

        //Enqueues an outgoing message -- called from the Service code
        public void EnqueueOutgoingMessage(Message msg, String session_id)
        {
            Logger.Instance.Debug("Enqueuing outgoing message: " + msg.Type);
            lock (padlock)
            {
                GuaranteeSessionMapped(session_id);
                id_queue[session_id].Enqueue(msg);
            }
        }

        //Send all messages queued for this session
        public String GetQueuedMessages(String session_id, String content_type)
        {
            GuaranteeSessionMapped(session_id);
            Logger.Instance.Debug("Returning " + id_queue[session_id].Count + " queued messages for Session ID: " + session_id);

            String outgoing_messages = getResponseHeader(content_type, session_id);

            while (id_queue[session_id].Count > 0)
            {
                lock (padlock)
                {
                    Message message = id_queue[session_id].Dequeue();
                    switch (content_type)
                    {
                        case ServiceBroker.APPLICATION_JSON:
                            outgoing_messages += message.GetMessageJSON();
                            break;
                        case ServiceBroker.XML_JSON:
                            outgoing_messages += message.GetMessageXML();
                            break;
                    }
                }
            }

            outgoing_messages += getResponseFooter(content_type);
            return outgoing_messages;
        }

        private string getResponseFooter(String content_type)
        {
            String footer = "";
            switch (content_type)
            {
                case ServiceBroker.APPLICATION_JSON:
                    footer = "]}";
                    break;
                case ServiceBroker.XML_JSON:
                    footer = "</messages>";
                    break;
            }
            return footer;
        }

        private string getResponseHeader(String content_type, String session_id)
        {
            double time = getTimeStamp();
            String xml_header = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
            xml_header += "<messages version='1.0' sessionid='" + session_id + "'>";

            /* 
             JSON Response schema:
                      version: the version of the Appcelerator protocol
                      encoding: the text encoding of the message (generally UTF-8)
                      sessionid: (optional) the session id of the current session
                      time: the timestamp of this response in ISO 8601 format with timezone specified
                      messages: (an array of objects conforming to the message schema below
            */
            String json_header = "{version:'1.1',encoding:'UTF-8',sessionid:'" + session_id + "',timestamp:" + time + ",messages:[";
            String header = "";

            switch (content_type)
            {
                case ServiceBroker.APPLICATION_JSON:
                    header = json_header;
                    break;
                case ServiceBroker.XML_JSON:
                    header = xml_header;
                    break;
            }
            return header;
        }

        public double getTimeStamp()
        {
            return Math.Floor((DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds);
        }

        private void GuaranteeSessionMapped(String session_id)
        {
            lock (padlock)
            {
                if (!id_queue.ContainsKey(session_id)) id_queue.Add(session_id, new Queue<Message>());
            }
        }
    }
}
