
Appcelerator.Module.Security =
{
	eventReceived:null,
	getName: function()
	{
		return 'appcelerator security';
	},
	getDescription: function()
	{
		return 'security widget';
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
		return 'app:security';
	},
	execute: function(id,parameterMap,data,scope,version)
	{
		Appcelerator.Module.Security.securityCode = parameterMap['code'].toFunction(true);
		Appcelerator.Module.Security.eventReceived = {data:data,scope:scope,version:version};
		Appcelerator.Module.Security.executeSecurity();
	},
	getActions: function()
	{
		return ['execute']
	},	
	getAttributes: function()
	{
		return [{name: 'on', optional: true, description: "May be used to execute the widget"}];
	},
	executeSecurity:function()
	{
		$$('*[security]').each(function(element)
		{
			Appcelerator.Module.Security.eventReceived.element = element;
			Appcelerator.Module.Security.eventReceived.roles = Appcelerator.Module.Security.eventReceived.element.getAttribute('security').split(',');
			var result = Appcelerator.Module.Security.securityCode.call(Appcelerator.Module.Security.eventReceived);
			if (result != true)
			{
				element.style.display='none';
				element.setAttribute('_compilerRemoved','true');
			}
		});
		$$('*[_compilerRemoved]').each(function (item)
		{
			Element.remove(item);
		});
	},
	buildWidget: function(element, parameters)
	{
		var code = Appcelerator.Compiler.getHtml(element);
		
		if (code && code.trim().length > 0)
		{
			if (parameters['on'])
			{
				parameters['code'] = String.unescapeXML(code);
				
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'parameters': parameters
				};
			}
			else
			{
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'presentation':'Error: security widget requires on attribute to execute'
				};
			}
		}
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation':'Error: security widget requires code inside tag for implementation'
		};
	}
};


Appcelerator.Core.registerModule('app:security',Appcelerator.Module.Security);
