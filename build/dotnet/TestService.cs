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
        public void HelloWorld(Message request, ref Message response)
        {
            JsonObject data = request.Data;
            data.Add("Hello","world");
            response.Data = data;
        }
    }
}

