/*
 * Author: Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.SessionState;

namespace Appcelerator
{
    sealed class Dispatcher
    {
        public Dictionary<string, Queue<Message>> id_queue = new Dictionary<string, Queue<Message>>();
        private static readonly Dispatcher instance = new Dispatcher();

        static Dispatcher() { }
        Dispatcher() { }

        public static Dispatcher Instance
        {
            get { return instance; }
        }

        //Sends messages to Services -- called from the ServiceBroker
        public void Dispatch(List<Message> messageList, ServiceManager manager, HttpRequest httprequest, HttpResponse httpresponse, HttpSessionState session, ServiceBroker broker)
        {
            foreach (Message request in messageList)
            {
                Message response = new Message(session, broker);
                response.Direction = MessageDirection.OUTGOING;
                manager.HandleRequest(request, ref response, session);
            }
        }

        //Enqueues an outgoing message -- called from the Service code
        public void EnqueueOutgoingMessage(Message msg, String session_id)
        {
            if (!id_queue.ContainsKey(session_id)) id_queue.Add(session_id, new Queue<Message>());
            id_queue[session_id].Enqueue(msg);
        }

        //Send all messages queued for this session
        public String GetQueuedMessages(String session_id)
        {
            String outgoing_messages = "";

            try
            {
                outgoing_messages += "<?xml version=\"1.0\"?>";
                outgoing_messages += "<messages version='1.0' sessionid='" + session_id + "'>";

                while (id_queue[session_id].Count > 0)
                {
                    Message message = id_queue[session_id].Dequeue();
                    outgoing_messages += message.GetMessageXML();
                }

                outgoing_messages += "</messages>";
            }
            catch (KeyNotFoundException)
            {
                // Do nothing -- no messages to get
                outgoing_messages = "Loading...";
            }

            return outgoing_messages;
        }
    }
}
