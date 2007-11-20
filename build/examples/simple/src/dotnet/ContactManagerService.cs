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
        [Service("example.contactdetails.request", "example.contactdetails.response")]
        public void GetDetails(Message request, ref Message response)
        {
            JsonObject data = response.Data;
            JsonArray people = new JsonArray();
            for (int i = 0; i < 3; i++)
            {
	            JsonObject person = new JsonObject();
	            person.Add("age", 24);
	            person.Add("sex", "male");
	            person.Add("name", "User "+i);
	            person.Add("us_citizen", true);
                people.Add(person);
            }
            data.Add("people", people);
            data.Add("success", true);
            response.Data = data;
        }
    }
}