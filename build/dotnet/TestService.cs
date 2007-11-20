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
	        JsonObject data = response.Data;

	        data.Add("framework_name", "Appcelerator");
	        data.Add("framework_version", 2);
	        data.Add("framework_isAwesome", true);

	        JsonArray items = new JsonArray();
	        for (int i = 0; i < 11; i++)
	        {
	            items.Add("item " + i);
	        }

	        data.Add("Hello", "world");
	        data.Add("items", items);

	        JsonObject person = new JsonObject();
	        person.Add("age", 24);
	        person.Add("sex", "male");
	        person.Add("name", "Amro");
	        person.Add("us_citizen", true);
	        data.Add("person", person);

	        response.Data = data;
	    }
    }
}

