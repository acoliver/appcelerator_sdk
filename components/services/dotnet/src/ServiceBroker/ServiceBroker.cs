/*
 * Author Amro Mousa
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
        public const String APPLICATION_JSON = "application/json";
        public const String XML_JSON = "xml/json";
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
            String content_type = request.ContentType;
            
            response.ContentType = request.ContentType;
            response.Expires = 0;
            response.CacheControl = "Private"; //no-cache, no-store, private, must-revalidate

            //This is needed to prevent the SessionID from changing on every request (if nothing is stored
            //in the session object
            context.Session["make_persistant"] = 1;

            String response_text = "";

            if (content_type == "" && request.QueryString.GetValues("initial") != null)
                return;
            
            content_type = content_type.Contains(XML_JSON) ? XML_JSON : APPLICATION_JSON;

            logger.Debug("Received HTTP Reqest of type: " + request.HttpMethod +" with content_type of " + content_type);
            switch (request.HttpMethod)
            {
                case "GET": // Send waiting message(s) to client [from queue]
                    response_text = dispatcher.GetQueuedMessages(session_id,content_type);
                    break;
                case "POST": // Dispatch incoming message(s) and send waiting message(s) to client [[from queue]
                    RequestDetails requestdetails = new RequestDetails(request.InputStream,content_type);
                    List<Message> incomingMessages = serviceManager.ParseIncomingMessages(context, this, requestdetails, content_type);

                    //Dispatch each incoming message from the list here once dispatcher, listeners are both done
                    dispatcher.Dispatch(incomingMessages, serviceManager,request,response,context.Session, this);
                    response_text = dispatcher.GetQueuedMessages(session_id,content_type);
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