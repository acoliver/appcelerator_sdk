/*
 * Author: Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;
using System.Reflection;
using System.Web.SessionState;
using System.IO;
using System.Web;

namespace Appcelerator
{
    class Service
    {
        //Private members
        private String _request;
        private String _response;
        private MethodInfo _methodInfo;

        /// <summary>
        /// Creates an Appcelerator Service
        /// </summary>
        /// <param name="request">The service request string (e.g. "r:my.message.request")</param>
        /// <param name="response">The service response string (e.g. "r:my.message.response")</param>
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
        public void InvokeServiceHandler(Message request, Message response, HttpSessionState session, HttpResponse httpresponse)
        {
            if (request.Equals(this.Request))
            {
                try
                {
                    Message temp_response = response;
                    Object[] parameters = new Object[] { request, temp_response };
                    Object declaringTypeInstance = Activator.CreateInstance(this.MethodInfo.DeclaringType);
                    this.MethodInfo.Invoke(declaringTypeInstance, parameters);
                    temp_response = (Message)parameters[1];
                    temp_response.Type = this.Response;

                    httpresponse.AppendToLog("BLEH " + temp_response.GetMessageXML());

                    Dispatcher.Instance.EnqueueOutgoingMessage(temp_response, session.SessionID);
                }
                catch (Exception e)
                {
                    String err = "";
                    err+="Error: Exception while invoking service handler - " + this.MethodInfo.Name + " in " + this.MethodInfo.DeclaringType.Name + "\n";
                    err += "Error: Request Message - " + request.Type + "\n";
                    err += "Error: Response Message - " + response.Type + "\n";
                    err += "Error: Message - " + e.Message + "\n";
                    err += "Error: Stacktrace - " + e.StackTrace + "\n";
                    httpresponse.AppendToLog(err);
                }
            }
        }

        /// <summary>
        /// The service request string (e.g. "r:my.message.request")
        /// </summary>
        public String Request
        {
            get { return _request; }
            set { _request = value; }
        }

        /// <summary>
        /// The service response string (e.g. "r:my.message.response")
        /// </summary>
        public String Response
        {
            get { return _response; }
            set { _response = value; }
        }

        /// <summary>
        /// The service response string (e.g. "r:my.message.response")
        /// </summary>
        public MethodInfo MethodInfo
        {
            get { return _methodInfo; }
            set { _methodInfo = value; }
        }
    }
}
