
Appcelerator={};


Appcelerator.Module=$$AM={};
Appcelerator.Widget=$$AW={};
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
		if (Object.isString(value) || Object.isObject(value) || Object.isNumber(value))
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





/***************************************************************************/
/*                                                                         */
/*  These are the public widget APIs that should be accessible by a user-  */
/*  defined widget.                                                        */
/*                                                                         */
/*                                                                         */
/***************************************************************************/


/**
 * called by a widget to register itself
 *
 * @param {string} modulename
 * @param {object} module object
 * @param {boolean} dynamic
 * @since 2.1.0
 */
Appcelerator.Widget.register = function(moduleName,module,dynamic)
{
    Appcelerator.Core.registerModule(moduleName,module,dynamic);
};

/**
 * called to load a js file relative to the module js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js files(s)
 * @param {string} js path
 */
Appcelerator.Widget.registerWithJS = function (moduleName,module,js,jspath)
{
    Appcelerator.Core.registerModule(moduleName,module,js,jspath);
};

/**
 * called to load a js file relative to the modules/common/js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js file(s)
 * @since 2.1.0
 */
Appcelerator.Widget.registerModuleWithCommonJS = function(moduleName,module,js)
{
    Appcelerator.Core.registerModuleWithCommonJS(moduleName,module,js);
};

/**
 * called to load a js file relative to the module js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js files(s)
 * @param {string} js path
 * @since 2.1.0
 */
Appcelerator.Widget.registerModuleWithJS = function (moduleName,module,js,jspath)
{
    Appcelerator.Core.registerModuleWithJS(moduleName,module,js,jspath);
};

/**
 * dynamically load CSS from common CSS path and call onload once 
 * loaded (or immediately if already loaded)
 *
 * @param {string} name of the common file
 * @param {function} onload function to invoke
 * @since 2.1.0
 */
Appcelerator.Widget.requireCommonCSS = function(name,onload)
{
    Appcelerator.Core.requireCommonCSS(name,onload);
};

/**
 * dynamically load JS from common JS path and call onload once 
 * loaded (or immediately if already loaded)
 *
 * @param {string} name of the common js
 * @param {function} onload function to callback upon load
 * @since 2.1.0
 */
Appcelerator.Widget.requireCommonJS = function(name,onload)
{
    Appcelerator.Core.requireCommonJS(name,onload);
};

/**
 * dynamically laod a javascript file with dependencies
 * this will not call the callback until all resources are loaded
 * multiple calls to this method are queued
 * 
 * @param {string} path to resource
 * @param {function} the string representation of the callback
 * @since 2.1.0
 */
Appcelerator.Widget.queueRemoteLoadScriptWithDependencies = function(path, onload) 
{
    Appcelerator.Core.queueRemoteLoadScriptWithDependencies(path, onload);
};

