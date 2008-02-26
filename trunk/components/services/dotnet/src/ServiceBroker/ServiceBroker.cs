/*
 * Autho Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Collections;
using System.IO;
using System.Xml.XPath;
using System.Web.SessionState;
using System.Diagnostics;

namespace Appcelerator
{
    public class ServiceBroker : IHttpHandler, IRequiresSessionState
    {
        private Dispatcher dispatcher = Dispatcher.Instance;
        private ServiceManager serviceManager;
        private Logger logger;
        public ServiceBroker()
        {
            serviceManager = new ServiceManager();
            logger = Logger.Instance;
            logger.Debug("Initialized ServiceBroker");
        }

        public void ProcessRequest(HttpContext context)
        {
            String session_id = context.Session.SessionID;
            HttpResponse response = context.Response;
            HttpRequest request = context.Request;

            response.ContentType = "text/xml;charset=UTF-8";
            response.Expires = 0;
            response.CacheControl = "Private"; //no-cache, no-store, private, must-revalidate

            //This is needed to prevent the SessionID from changing on every request (if nothing is stored
            //in the session object
            context.Session["make_persistant"] = 1;

            String response_text = "";

            logger.Debug("Received HTTP Reqest of type: " + request.HttpMethod);
            switch (request.HttpMethod)
            {
                case "GET": // Send waiting message(s) to client [from queue]
                    response_text = dispatcher.GetQueuedMessages(session_id);
                    break;
                case "POST": // Dispatch incoming message(s) and send waiting message(s) to client [[from queue]
                    XPathDocument doc = new XPathDocument(request.InputStream);
                    XPathNodeIterator iter = doc.CreateNavigator().Select("//message");

                    RequestDetails requestdetails = new RequestDetails(doc.CreateNavigator().OuterXml);
                    List<Message> incomingMessages = serviceManager.ParseIncomingMessages(iter, context, this, requestdetails);

                    //Dispatch each incoming message from the list here once dispatcher, listeners are both done
                    dispatcher.Dispatch(incomingMessages, serviceManager,request,response,context.Session, this);
                    response_text = dispatcher.GetQueuedMessages(session_id);
                    break;
            }

            response.Write(response_text);
        }

        public bool IsReusable
        {
            get { return true; }
        }
    }
}