/*
 * Author Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Collections;
using System.Reflection;
using System.Web;
using System.Web.SessionState;
using System.IO;
using System.Xml.XPath;
using NetServ.Net.Json;

namespace Appcelerator
{
    class ServiceManager
    {
        private Dictionary<String, List<Service>> _requestToServiceMap;
        private static FileSystemWatcher fsw;
        String deploydir = "";

        /// <summary>
        /// Initializes the service manager, loads assemblies from the deploy dir and 
        /// adds a file system watcher to load new assemblies
        /// upon their creation
        /// </summary>
        public ServiceManager()
        {
            //The directory to check for dlls to load
            deploydir = AppDomain.CurrentDomain.BaseDirectory + @"\..\app\services";

            if (!new DirectoryInfo(deploydir).Exists) Directory.CreateDirectory(deploydir);

            fsw = new FileSystemWatcher();
            fsw.Path = deploydir;
            fsw.NotifyFilter = NotifyFilters.LastAccess | NotifyFilters.LastWrite | NotifyFilters.FileName;
            fsw.Created += new FileSystemEventHandler(fsw_Created);
            fsw.EnableRaisingEvents = true;

            LoadServiceHandlerAssemblies();

            RegisterServiceHandlers();
        }

        /// <summary>
        /// Loads all assemblies in the deploy directory
        /// </summary>
        private void LoadServiceHandlerAssemblies()
        {
            foreach (String file in Directory.GetFiles(deploydir))
            {
                LoadSingleAssembly(file);
            }
        }

        /// <summary>
        /// Handles the file created event in the deploy dir so we can load assemblies
        /// </summary>
        /// <param name="sender">The object sending the event</param>
        /// <param name="e">The FileSystemEvenArgs containing the path of the assembly container to load</param>
        void fsw_Created(object sender, FileSystemEventArgs e)
        {
            LoadSingleAssembly(e.FullPath);
        }

        /// <summary>
        /// Loads a single assembly given its full path
        /// </summary>
        /// <param name="file_location">The full path location of the file from which to load assemblies</param>
        private void LoadSingleAssembly(String file_location)
        {
            try
            {
                Assembly assy = Assembly.LoadFile(file_location);
                //RegisterServicesFromAssembly(assy);
            }
            catch 
            {
                Logger.Instance.Error("Unable to load services from " + file_location);
            };
        }

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
                RegisterServicesFromAssembly(assy);
            }
        }

        private void RegisterServicesFromAssembly(Assembly assy)
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
                        Logger.Instance.Debug("Registering request: " + attr.Request + " to service handler: " + method.Name + " with response: " + attr.Response);
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

        /// <summary>
        /// Invokes the appropriate handler for a given request
        /// </summary>
        /// <param name="request">The ServiceRequest object corresponding to the incoming request</param>
        /// <param name="response">The ServiceResponse object corresponding to the outgoing response</param>
        public void HandleRequest(Message request, Message response, HttpSessionState session, HttpResponse httpresponse)
        {

            try
            {
                Logger.Instance.Debug("Invoking services for request: " + request.Type);
                List<Service> handlers = RequestToServiceMap[request.Type];

                foreach (Service handler in handlers)
                {
                    handler.InvokeServiceHandler(request, response, session, httpresponse);
                }
            }
            catch (KeyNotFoundException)
            {
                //There's no Service to handle the incoming request -- Log it to the console
                Logger.Instance.Debug("No service registered to handle request: " + request.Type);
            }
        }

        /// <summary>
        /// Parses incoming messages and returns a list to be dispatched
        /// </summary>
        /// <param name="iter">The iterator with the message element list (xml)</param>
        /// <param name="context">The HttpContext of the request</param>
        /// <param name="broker">The ServiceBroker handling the request</param>
        /// <param name="details">The RequestDetails from the request</param>
        /// <returns></returns>
        public List<Message> ParseIncomingMessages(HttpContext context, ServiceBroker broker, RequestDetails details, String content_type)
        {
            List<Message> messages = new List<Message>();
            switch (content_type)
            {
                case ServiceBroker.APPLICATION_JSON:
                    JsonArray messageArray = (JsonArray)details.JSON["messages"];

                    foreach (JsonObject jsonMessage in messageArray)
                    {
                        Message m = new Message(jsonMessage, context.Session, broker, details);
                        m.Direction = MessageDirection.INCOMING;
                        messages.Add(m);
                    }
                    break;
                case ServiceBroker.XML_JSON:
                    XPathNodeIterator iter = details.XMLIterator;

                    while (iter.MoveNext())
                    {
                        Message m = new Message(iter.Current, context.Session, broker, details);
                        m.Direction = MessageDirection.INCOMING;
                        messages.Add(m);
                    }
                    break;
            }

            Logger.Instance.Debug("Parsed " + messages.Count + " incoming message(s)");
            return messages;
        }

        /// <summary>
        /// Returns a Dictionary collection that maps the service request 
        /// string (e.g. "my.request") to the Service to be called upon receiving
        /// a request of that name
        /// </summary>
        public Dictionary<String, List<Service>> RequestToServiceMap
        {
            get { return _requestToServiceMap; }
        }

        public FileSystemWatcher FileSystemWatcher
        {
            get { return fsw; }
            set { fsw = value; }
        }
    }
}
