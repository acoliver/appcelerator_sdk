
Appcelerator.Module.Script =
{
	getName: function()
	{
		return 'appcelerator script';
	},
	getDescription: function()
	{
		return 'script widget';
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
		return 'app:script';
	},
	execute: function(id,parameterMap,data,scope,version)
	{
		var code = parameterMap['code'];
		var script = code.toFunction(true);
		if (script == true) return;
		script.call({data:data||{},scope:scope,version:version});
	},
	executeCode: function(params)
	{
		eval(params['code']);
	},
	buildWidget: function(element)
	{
		var code = Appcelerator.Compiler.getHtml(element);
		code.replace(/\/\*.*\*\//g,'');
		var on = element.getAttribute('on');

		if (code && code.trim().length > 0)
		{
			if (on)
			{
				Appcelerator.Compiler.parseOnAttribute(element);
				
				var parameters = {};
				parameters['code'] = String.unescapeXML(code);
				
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'parameters': parameters,
					'functions' : ['execute']
				};
			}
			else
			{
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'initialization' : Appcelerator.Module.Script.executeCode,
					'initializationParams' : {code: String.unescapeXML(code)}
				};
			}
		}
		
		Appcelerator.Compiler.parseOnAttribute(element);
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REMOVE
		};
	}
};


Appcelerator.Core.registerModule('app:script',Appcelerator.Module.Script);