
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
		return 'app:script';
	},
	getAttributes: function()
	{
		return [{name: 'on', optional: true, description: "May be used to execute the script's content."}];
	},
	execute: function(id,parameterMap,data,scope,version)
	{
		var code = parameterMap['code'];
		var script = code.toFunction(true);
		if (script == true) return;
		script.call({data:data||{},scope:scope,version:version});
	},
	compileWidget: function(params)
	{
		window.eval(params['code']);
	},
	buildWidget: function(element,parameters)
	{
		var code = Appcelerator.Compiler.getHtml(element);
		code = code.replace(/\/\*.*\*\//g,'');

		if (code && code.trim().length > 0)
		{
			parameters['code'] = String.unescapeXML(code);

			if (parameters['on'])
			{
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'functions' : ['execute']
				};
			}
			else
			{
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'compile' : true
				};
			}
		}

		return {
			'position' : Appcelerator.Compiler.POSITION_REMOVE
		};
	}
};


Appcelerator.Core.registerModule('app:script',Appcelerator.Module.Script);

