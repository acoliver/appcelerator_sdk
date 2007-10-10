
Appcelerator.Module.Message =
{
	getName: function()
	{
		return 'appcelerator message';
	},
	getDescription: function()
	{
		return 'message widget';
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
		return 'app:message';
	},
	execute: function(id,parameterMap,data,scope,version)
	{
		Appcelerator.Module.Message.sendMessage(parameterMap);
	},
	buildWidget: function(element)
	{
		var name = element.getAttribute('name');
		var args = element.getAttribute('args');
		var version = element.getAttribute('version');
		var on = element.getAttribute('on');
		
		args = args ? String.unescapeXML(args) : null;

		var interval = element.getAttribute('interval');
		
		var parameters = {args:args, name:name, scope:element.scope, interval:interval,version:version};
		
		if (on)
		{
			var oncode = Appcelerator.Compiler.parseOnAttribute(element);
			return {
				'position' : Appcelerator.Compiler.POSITION_REMOVE,
				'initialization':  oncode,
				'functions': ['execute'],
				'parameters': parameters
			};
		}
		else
		{
			var code = 'Appcelerator.Module.Message.sendMessage('+Object.toJSON(parameters)+');';			
			return {
				'position' : Appcelerator.Compiler.POSITION_REMOVE,
				'initialization' : code
			};
		}
	},
	sendMessage: function(params)
	{
		var name = params.name;
		var args = params.args;
		var version = params.version;
		var scope = params.scope;
		var interval = params.interval;
		
		if (args && args != 'null')
        {
            var data = Object.evalWithinScope(args, window);
        }

		$MQ(name, data, scope, version);
		
		if (interval!=null)
	    {
	    	var time = parseInt(interval);
	    	if (time > 0)
	    	{
		    	var timer = setInterval(function()
		    	{
		    		if (args && args != 'null')
		    		{
		    			// re-evaluate each time so you can dynamically change data each interval
				        data = Object.evalWithinScope(args, window);
		    		}
					$MQ(name, data, scope, version);
		    	}, time);
	    	}
	    }
	}
};

Appcelerator.Core.registerModule('app:message',Appcelerator.Module.Message);