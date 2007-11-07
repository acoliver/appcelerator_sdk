Appcelerator.Module.Datacache = {};


Appcelerator.Module.Datacache =
{
	cache:[],
	
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
	getAuthor: function()
	{
		return 'Jeff Haynie';
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
	buildWidget: function(element)
	{
	    var request = element.getAttribute('request');
		var response = element.getAttribute('response');
		var keepAlive = element.getAttribute('keepAlive') || 1800000;
		var autoRefresh = element.getAttribute('autoRefresh') || false;
		
	    if (!request)
	    {
	        throw "syntax error: required 'request' attribute for "+element.id;
	    }
	
		if (!response)
		{
	        throw "syntax error: required 'response' attribute for "+element.id;			
		}
		request = Appcelerator.Util.ServiceBroker.convertType(request);
		response = Appcelerator.Util.ServiceBroker.convertType(response);
		var entry = {req:request,resp:response,ttl:parseInt(keepAlive),data:null,timestamp:new Date().getTime(),refresh:autoRefresh};
		Appcelerator.Module.Datacache.cache.push(entry);

		var interceptor = 
		{
		  	interceptQueue: function(msg,callback,messageType,scope)
		  	{ 		
				if (messageType == request)
				{
					if (entry.data)
					{
						entry.data.app_datacache_message = true;
						$MQ(response, entry.data, scope);
						return false;
					}
					else
					{
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
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REMOVE
		};
	},
	
	dataCacheTimer: function()
	{
		var now = new Date().getTime();

		for (var c=0;c<Appcelerator.Module.Datacache.cache.length;c++)
		{
			var entry = Appcelerator.Module.Datacache.cache[c];
			if (now >= entry.ttl + entry.timestamp)
			{
				entry.data = null;
				if (entry.refresh == true || entry.refresh == "true")
				{
					$MQ(entry.req, {});
				}
			}
		}
	}
};
setInterval(Appcelerator.Module.Datacache.dataCacheTimer,30000);

Appcelerator.Core.registerModule('app:datacache',Appcelerator.Module.Datacache);