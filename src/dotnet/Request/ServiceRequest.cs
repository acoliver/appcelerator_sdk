/*
 * Author: Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;

namespace Appcelerator
{
    class ServiceRequest
    {
        private String _request;

        public ServiceRequest(String request)
        {
            this.Request = request.ToLower();
        }

        /// <summary>
        /// The the string containing the request value (e.g. "r:my.request)
        /// </summary>
        public String Request
        {
            get { return _request; }
            set { _request = value; }
        }

        public bool Equals(String matchRequest)
        {
            return this.Request.Equals(matchRequest.ToLower());
        }
    }
}
