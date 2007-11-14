/*
 * Author: Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Collections;
using System.Reflection;
using System.Web;
using System.Web.SessionState;

namespace Appcelerator
{
    class ServiceManager
    {
        private Dictionary<String, List<Service>> _requestToServiceMap;
        /// <summary>
        /// Finds and initializes service handlers (methods with a ServiceAttribute defined)
        /// </summary>
        /// <returns>A list of Services</returns>
        public void RegisterServiceHandlers()
        {
            _requestToServiceMap = new Dictionary<String, List<Service>>();

            Assembly[] asms = AppDomain.CurrentDomain.GetAssemblies();
            foreach (Assembly assy in asms)
            {
                Type[] types = assy.GetTypes();

                foreach (Type type in types)
                {
                    MethodInfo[] methodInfos = type.GetMethods();

                    foreach (MethodInfo method in methodInfos)
                    {
                        ServiceAttribute attr = (ServiceAttribute)Attribute.GetCustomAttribute(method, typeof(ServiceAttribute));

                        if (attr != null)
                        {
                            Service service = new Service(attr.Request, attr.Response, method);

                            try
                            {
                                this.RequestToServiceMap.Add(attr.Request, new List<Service>());
                                this.RequestToServiceMap[attr.Request].Add(service);
                            }
                            catch (ArgumentException)
                            {
                                // There's already another list of handlers for this request, so add the new service to that list
                                this.RequestToServiceMap[attr.Request].Add(service);
                            }
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Invokes the appropriate handler for a given request
        /// </summary>
        /// <param name="request">The ServiceRequest object corresponding to the incoming request</param>
        /// <param name="response">The ServiceResponse object corresponding to the outgoing response</param>
        public void HandleRequest(Message request, ref Message response, HttpSessionState session)
        {
            try
            {
                List<Service> handlers = RequestToServiceMap[request.Type];

                foreach (Service handler in handlers)
                {
                    handler.InvokeServiceHandler(request, ref response, session);
                }
            }
            catch (KeyNotFoundException)
            {
                //There's no Service to handle the incoming request -- Log it to the console
                Console.WriteLine("Info: No server registered to handle request: " + request.Type);
            }
        }

        public List<Message> ParseIncomingMessages(System.Xml.XPath.XPathNodeIterator iter, HttpContext context, ServiceBroker broker, RequestDetails details)
        {
            List<Message> messages = new List<Message>();

            while (iter.MoveNext())
            {
                Message m = new Message(iter.Current.OuterXml, context.Session, broker, details);
                m.Direction = MessageDirection.INCOMING;
                messages.Add(m);
            }

            return messages;
        }

        /// <summary>
        /// Returns a Dictionary collection that maps the service request 
        /// string (e.g. "r:my.request") to the Service to be called upon receiving
        /// a request of that name
        /// </summary>
        public Dictionary<String, List<Service>> RequestToServiceMap
        {
            get { return _requestToServiceMap; }
        }
    }
}
