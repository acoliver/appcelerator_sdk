
Appcelerator={};


Appcelerator.Module=$$AM={};
Appcelerator.Core=$$AR={};
Appcelerator.Util=$$AU={};
Appcelerator.Browser=$$AB={};
Appcelerator.Decorator=$$AD={};
Appcelerator.Validator=$$AV={};
Appcelerator.Compiler=$$AC={};

Appcelerator.Loader={};
Appcelerator.Loader.requiredFunctions = [
	["getName",true,"name"],
	["getDescription",true,"description"],
	["getVersion",true,"version"],
	["getSpecVersion",true,"specVersion"],
	["getAuthor",true,"author"],
	["getModuleURL",true,"moduleURL"],
	["isWidget",true,"widget"],
	["getWidgetName",true,"widgetName"],
	["getAttributes",true,"attributes"],
	["buildWidget",false]
];


Appcelerator.Loader.Results={};


Appcelerator.Compiler.registerCustomCondition=Prototype.K;

Object.isObject=function(obj)
{
	return typeof(obj)!='undefined' && typeof(obj)=='object';
};

Appcelerator.Core.registerModule = function(name,module)
{
	Appcelerator.Loader.loadModule(name,module);
};

Appcelerator.Loader.loadModule=function(name,module)
{
	var definition = {'invalid':false,'errors':[],'moduleName':name};

	for (var c=0;c<Appcelerator.Loader.requiredFunctions.length;c++)
	{
		var propobj = Appcelerator.Loader.requiredFunctions[c];
		var propname = propobj[0];
		var propfunc = module[propname];
		if (typeof(propfunc)=='undefined')
		{
			definition['invalid']=true;
			definition['errors'].push("missing required property: "+propname);
		}
		else
		{
			if (propobj[1])
			{ 
				var propvalue = propfunc();
				Appcelerator.Loader.Results[propobj[2]]=propvalue;
			}
		}
	}
	for (var p in Appcelerator.Loader.Results)
	{
		var value = Appcelerator.Loader.Results[p];
		if (Object.isString(value) || Object.isObject(value))
		{
			definition[p]=value;
		}
	}

	print(Object.toJSON(definition));
};

Appcelerator.Core.registerModuleWithJS = function(name,module,js)
{
	Appcelerator.Loader.loadModule(name,module);
};

Appcelerator.Core.loadModuleCSS = Prototype.K;

Appcelerator.Core.requireCommonJS = function(name,callback)
{
	callback();
};

