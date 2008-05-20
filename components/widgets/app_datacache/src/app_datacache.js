/*
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

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
		return 1.0;
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
