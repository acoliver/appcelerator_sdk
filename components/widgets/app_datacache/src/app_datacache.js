/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/

Appcelerator.Widget.Datacache =
{
	cache:[],
	timerStarted: false,
	
	getName: function()
	{
		return 'appcelerator datacache';
	},
	getDescription: function()
	{
		return 'datacache widget';
	},
	getVersion: function()
	{
		return "__VERSION__";
	},
	getSpecVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Nolan Wright';
	},
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'app:datacache';
	},
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [
		{
		    name: 'request', 
		    optional: false, 
		    type: T.messageReceive,
		    description: "The message request to cache."
		}, {
		    name: 'response', 
		    optional: false, 
		    type: T.messageSend,
			description: "The message response to cache."
		}, {
		    name: 'keepAlive', 
		    optional: true, 
		    defaultValue: 1800000,
			description: "Keep alive",
			type: T.number
		}, {
		    name: 'autoRefresh', 
		    optional: true, 
		    defaultValue: false,
			description: "Auto refresh",
			type: T.bool
		}, {
		    name: 'reaperInterval',
		    optional: true,
		    defaultValue: 30000,
		    description: "How often the datacache will go through to expire entires.  This applies to ALL datacache widgets " + 
		        " and must be on the first widget"
		}];
	},	
	buildWidget: function(element, parameters)
	{
	    var request = parameters['request'];
		var response = parameters['response'];
		var keepAlive = parameters['keepAlive'];
		var autoRefresh = parameters['autoRefresh'];
		var reaperInterval = parameters['reaperInterval'];
		
        request = Appcelerator.Util.ServiceBroker.convertType(request);
        response= Appcelerator.Util.ServiceBroker.convertType(response);

        if (!Appcelerator.Compiler.isCompiledMode)
        {
			if (!Appcelerator.Widget.Datacache.timerStarted)
			{
				Appcelerator.Widget.Datacache.timerStarted = true;
				setInterval(function()
				{
					Appcelerator.Widget.Datacache.dataCacheTimer();
				}, reaperInterval);
			}
			
            var entry = {req:request,resp:response,ttl:parseInt(keepAlive),args:null,data:null,timestamp:new Date().getTime(),refresh:autoRefresh};
            Appcelerator.Widget.Datacache.cache.push(entry);
			var interceptor = 
			{
			  	interceptQueue: function(msg,callback,messageType,scope)
			  	{ 		
					if (messageType == request)
					{
                        if (entry.data 
                                && !Appcelerator.Widget.Datacache.isExpired(entry,new Date().getTime())
                                && Appcelerator.Widget.Datacache.equals(entry.args, msg.data)
                        )
						{
							entry.data.app_datacache_message = true;
							$MQ(response, entry.data, scope);
							return false;
						}
						else
						{
						    entry.args = msg.data;
							return true;
						}
					}
					if (messageType == response)
					{
						if (msg['data'].app_datacache_message)
						{
							return true;
						}
						entry.data = msg['data']; 
						entry.timestamp = new Date().getTime();
						return true;
					}
				} 
			};
			Appcelerator.Util.ServiceBroker.addInterceptor(interceptor);
        }
        		
		return {
			'position' : Appcelerator.Compiler.POSITION_REMOVE
		};
	},
	
	dataCacheTimer: function()
	{
		var now = new Date().getTime();

		for (var c=0;c<Appcelerator.Widget.Datacache.cache.length;c++)
		{
			var entry = Appcelerator.Widget.Datacache.cache[c];
			if (Appcelerator.Widget.Datacache.isExpired(entry,now))
			{
				entry.data = null;
				if (entry.refresh == true || entry.refresh == "true")
				{
					$MQ(entry.req, {});
				}
			}
		}
	},
	
	isExpired: function(entry, now) 
	{
	    return now >= entry.ttl + entry.timestamp;
	},
	
	equals: function(left, right) {
      if(left == right) return true;
      if(typeof left == "object" && typeof right == "object") {
        for(var field in left) {
          if(!Appcelerator.Widget.Datacache.equals(left[field], right[field])) {
            return false;
          }
        }
        // somewhat redundant and inefficient...
        for(var field in right) {
          if(!Appcelerator.Widget.Datacache.equals(left[field], right[field])) {
            return false;
          }
        }
        return true;
      }
    }
};

Appcelerator.Widget.register('app:datacache',Appcelerator.Widget.Datacache);
