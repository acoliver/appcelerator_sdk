using System;
using System.Collections.Generic;
using System.Text;
using Appcelerator;
using NetServ.Net.Json;
namespace ContactManagerService
{
    public class ContactManagerService
    {
        [Service("example.createcontact.request", "example.createcontact.response")]
        public void TestMessageHandler(Message request, ref Message response)
        {
            response.Data.Add("success", true);
            response.Data.Add("id", 101);
        }
    }
}