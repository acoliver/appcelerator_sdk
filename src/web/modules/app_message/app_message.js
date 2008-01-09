
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
	getSpecVersion: function()
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
	getActions: function()
	{
		return ['execute','stop'];
	},	
	getAttributes: function()
	{
        var T = Appcelerator.Types;
        return [{
            name: 'on',
            optional: true,
            type: T.onExpr,
            description: "May be used to express when the message should be fired (executed)."
        }, {
            name: 'name',
            optional: false,
            type: T.messageSend,
            description: "The name of the message to be fired."
        }, {
            name: 'args',
            optional: true,
            type: T.json,
            description: "The argument payload of the message."
        }, {
            name: 'version',
            optional: true,
            description: "The version attached to the message."
        }, {
            name: 'interval',
            optional: true,
            type: T.time,
            description: "Indicates that an time interval that the message will continously be fired."
        }]
	},
	
	execute: function(id,parameterMap,data,scope,version)
    {
        Appcelerator.Module.Message.sendMessage(parameterMap);
    },
    stop: function(id,parameterMap,data,scope,version)
    {
        var timer = parameterMap['timer'];
        if(timer)
        {
            clearInterval(timer);
            parameterMap['timer'] = null;
        }
        else
        {
            $D('Message '+parameterMap['name']+' is not currently sending, cannot stop');
        }
    },
	buildWidget: function(element, attributes)
	{
		var name = attributes['name'];
		var args = attributes['args'];
		var version = attributes['version'];
		var on = attributes['on'];
		
		args = args ? String.unescapeXML(args) : null;
		
		var interval = attributes['interval'];
		
		var parameters = {args:args, name:name, scope:element.scope, interval:interval,version:version};
		
		if (on)
		{
			return {
				'position' : Appcelerator.Compiler.POSITION_REMOVE,
				'parameters': parameters
			};
		}
		else
		{
			Appcelerator.Module.Message.sendMessage(parameters);
			return {
				'position' : Appcelerator.Compiler.POSITION_REMOVE
			};
		}
	},
	/*
	 * If the widget has an interval set, begin sending polling messages,
	 * otherwise send a one-shot message.
	 */
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
		
		if (interval != null)
	    {
	    	var time = Appcelerator.Util.DateTime.timeFormat(interval);
	    	if (time > 0)
	    	{
		    	params['timer'] = setInterval(function()
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