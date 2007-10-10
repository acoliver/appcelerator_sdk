
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
	buildWidget: function(element)
	{
		var code = Appcelerator.Compiler.getHtml(element);
		var on = element.getAttribute('on');
		 
		if (code && code.trim().length > 0)
		{
			if (on)
			{
				var oncode = Appcelerator.Compiler.parseOnAttribute(element);

				var parameters = {};
				parameters['code'] = String.unescapeXML(code);
				
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'parameters': parameters,
					'functions' : ['execute'],
					'initialization':  oncode
				};
			}
			else
			{
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'initialization' : String.unescapeXML(code)
				};
			}
		}
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REMOVE,
			'initialization' : Appcelerator.Compiler.parseOnAttribute(element)
		};		
	}
};


Appcelerator.Core.registerModule('app:script',Appcelerator.Module.Script);