/*
 * Autho Amro Mousa
 * Contact: amousa@appcelerator.com
 */

namespace Appcelerator
{
    using System;
    using System.Reflection;

    // create custom attribute to be assigned to class members
    [AttributeUsage(AttributeTargets.Method, AllowMultiple=false)]
    public class ServiceAttribute : System.Attribute
    {
        //Private members
        private string _request;
        private string _response;
        
        /// <summary>
        /// Creates a Service Attribute
        /// </summary>
        /// <param name="request">The service request string (e.g. "my.message.request")</param>
        /// <param name="response">The service response string (e.g. "my.messagege.response")</param>
        public ServiceAttribute(string request, string response)
        {
            _request = request;
            _response = response;
        }

        /// <summary>
        /// The service request string (e.g. "my.message.request")
        /// </summary>
        public string Request
        {
            get
            {
                return _request;
            }
        }

        /// <summary>
        /// The service response string (e.g. "my.messagege.response")
        /// </summary>
        public string Response
        {
            get
            {
                return _response;
            }
        }
    }
}