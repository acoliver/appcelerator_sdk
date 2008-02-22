/*
 * Autho Amro Mousa
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
        public String GetQueuedMessages(String session_id)
        {
            GuaranteeSessionMapped(session_id);

            String outgoing_messages = "";

            Logger.Instance.Debug("Returning " + id_queue[session_id].Count + " queued messages for Session ID: " + session_id);

            outgoing_messages += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
            outgoing_messages += "<messages version='1.0' sessionid='" + session_id + "'>";

            while (id_queue[session_id].Count > 0)
            {
                lock (padlock)
                {
                    Message message = id_queue[session_id].Dequeue();
                    outgoing_messages += message.GetMessageXML();
                }
            }

            outgoing_messages += "</messages>";

            return outgoing_messages;
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
