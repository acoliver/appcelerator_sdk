using System;
using System.Collections.Generic;
using System.Text;
using Appcelerator;
using NetServ.Net.Json;
namespace HelloWorld
{
    public class TestService
    {
        [Service("r:hello.request", "r:hello.response")]
        public void HelloWorld(Message request, ref Message response)
        {
            JsonObject data = request.Data;
            data.Add("Hello","world");
            response.Data = data;
        }
    }
}
