using System;
using System.Collections.Generic;
using System.Text;
using Appcelerator;
using NetServ.Net.Json;
namespace TestService
{
    public class TestService
    {
        [Service("app.test.message.request", "app.test.message.response")]
        public void TestMessageHandler(Message request, ref Message response)
        {
            response.Data.Add("success", true);
            String message;
            try
            {
                message = ((JsonString)request.Data["message"]).Value;
            }
            catch
            {
                message = "";
            }
            response.Data.Add("message", "I received from you " + message);
        }
    }
}