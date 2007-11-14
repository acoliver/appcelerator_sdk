/*
 * Author: Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Reflection;
using System.Web.SessionState;

namespace Appcelerator
{
    public class Service
    {
        //Private members
        private String _request;
        private String _response;
        private MethodInfo _methodInfo;

        /// <summary>
        /// Creates an Appcelerator Service
        /// </summary>
        /// <param name="request">The service request string (e.g. "r:my.message.request)</param>
        /// <param name="response">The service response string (e.g. "r:my.message.response)</param>
        /// <param name="methodInfo">The MethodInfo object describing the method to invoke upon receiving a request</param>
        public Service(String request, String response, MethodInfo methodInfo)
        {
            this.Request = request;
            this.Response = response;
            this.MethodInfo = methodInfo;
        }

        /// <summary>
        /// Invokes the appropriate service handler (registered using a ServiceAttribute)
        /// </summary>
        public void InvokeServiceHandler(Message request, ref Message response, HttpSessionState session)
        {
            if (request.Equals(this.Request))
            {
                try
                {
                    response.Type = this.Response;
                    
                    Object declaringTypeInstance = Activator.CreateInstance(this.MethodInfo.DeclaringType);
                    Object o = this.MethodInfo.Invoke(declaringTypeInstance, new object[] { request, response });
                    Dispatcher.Instance.EnqueueOutgoingMessage(response, session.SessionID);
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error: Exception while invoking service handler - " + this.MethodInfo.Name + " in " + this.MethodInfo.DeclaringType.Name);
                    Console.WriteLine("Error: Request Message - " + request.Type);
                    Console.WriteLine("Error: Response Message - " + response.Type);
                    Console.WriteLine("Error: Message - " + e.Message);
                    Console.WriteLine("Error: Stacktrace - " + e.StackTrace);
                }
            }
        }

        /// <summary>
        /// The service request string (e.g. "r:my.message.request)
        /// </summary>
        public String Request
        {
            get { return _request; }
            set { _request = value; }
        }

        /// <summary>
        /// The service response string (e.g. "r:my.message.response)
        /// </summary>
        public String Response
        {
            get { return _response; }
            set { _response = value; }
        }

        /// <summary>
        /// The service response string (e.g. "r:my.message.response)
        /// </summary>
        public MethodInfo MethodInfo
        {
            get { return _methodInfo; }
            set { _methodInfo = value; }
        }
    }
}
