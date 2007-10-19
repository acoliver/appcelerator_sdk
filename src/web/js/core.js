/**
 * Appcelerator Core
 */

Appcelerator.Core = {};
Appcelerator.Core.Browser = {};

Appcelerator.Core.usedModules = {};
Appcelerator.Core.modules = [];
Appcelerator.Core.fetching = {};

Appcelerator.Core.HeadElement = document.getElementsByTagName('head')[0];

//
// load a module and invoke the onload function (if provided) 
// when loaded
//
Appcelerator.Core.require = function (moduleName,onload)
{
	moduleName = moduleName.replace(':','_');
	Appcelerator.Core.usedModules[moduleName]=true;
	var module = Appcelerator.Core.modules[moduleName];
	if (!module)
	{
		var path = Appcelerator.ModulePath + moduleName + '/module.js';

		// first check to see if we're already fetching this module and if so
		// just add ourselves as a listener to be notified		
		var array = Appcelerator.Core.fetching[path];
		if (array)
		{
			array.push(onload);
			return;
		}
		Appcelerator.Core.fetching[path]=[];
		
		var script = document.createElement('script');
		script.setAttribute('type','text/javascript');
		script.setAttribute('src',path);
		var loaded = false;
		var loadFunc = function()
		{
			if (Appcelerator.Browser.isIE)
			{
				switch(this.readyState)
				{
					case 'loaded':   // state when loaded first time
					case 'complete': // state when loaded from cache
						break;
					default:
						return;
				}
			}
			
			if (loaded) return;
			loaded = true;
			if (typeof onload == 'function') onload();
			var listeners = Appcelerator.Core.fetching[path];
			if (listeners)
			{
				// notify any pending listeners
				for (var c=0;c<listeners.length;c++)
				{
					listeners[c]();
				}
				delete Appcelerator.Core.fetching[path];
			}
		};
		script.onload = loadFunc;
		script.onreadystatechange = loadFunc;
		script.onerror = function(e)
		{
			Logger.error('Error loading module '+moduleName+' from '+path+'\n Exception: '+Object.getExceptionDetail(e));
			alert('error loading module '+moduleName+' from '+path);
		};
		Appcelerator.Core.HeadElement.appendChild(script);
	}
	else
	{
		if (typeof onload == 'function') onload();
	}
};

Appcelerator.Core.widgets = {};
Appcelerator.Core.widgets_css = {};

//
// called to load a css file relative to the module css directory
//
Appcelerator.Core.loadModuleCSS = function(moduleName,css)
{
	moduleName = moduleName.replace(':','_');
	var path = Appcelerator.ModulePath + moduleName + '/css/' + css;
	var loaded = Appcelerator.Core.widgets_css[path];
	if (!loaded)
	{
		var link = document.createElement('link');
		link.setAttribute('type','text/css');
		link.setAttribute('rel','stylesheet');
		link.setAttribute('href',path);
		link.setAttribute('id','css_'+moduleName);
		
		var refPoint = null;
		for (var c=0;c<Appcelerator.Core.HeadElement.childNodes.length;c++)
		{
			var element = Appcelerator.Core.HeadElement.childNodes[c];
			if (element.nodeType == 1 && element.nodeName == "LINK")
			{
				var src = element.getAttribute("href");
				var type = element.getAttribute("type");
				if (src && type && type.indexOf('css') > 0)
				{
					refPoint = element;
					break;
				}
			}
		}
		if (refPoint)
		{
			// insert it before the first css so that it won't override applications css
			Appcelerator.Core.HeadElement.insertBefore(link,refPoint);
		}
		else
		{
			Appcelerator.Core.HeadElement.appendChild(link);
		}
		Appcelerator.Core.widgets_css[path]=moduleName;

		//Refresh css (link tags only) in IE 6/7 because the give priority to css in load order, not document order
		if (Appcelerator.Browser.isIE)
		{
			var ss = document.styleSheets;				
			var arr = [];
			
			try
			{
				for (var i = 0; i < document.styleSheets.length; i++)
				{
					arr.push (document.styleSheets[i].owningElement.outerHTML);
				}				
			} catch (e) { throw 'Failed to gather CSS: ' + e.message; }

			try
			{
				arr.reverse();
				
				for (var i = 0; i < arr.length; i++)
				{
					document.getElementsByTagName('head')[0].appendChild(document.createElement(arr[i]));
				}
			} catch (e) { throw 'Failed to refresh CSS: ' + e.message; }
		}
	}
};

//
// Modules must call this to register themselves with the framework
//
Appcelerator.Core.registerModule = function (moduleName,module)
{
	moduleName = moduleName.replace(':','_');
	Appcelerator.Core.modules[moduleName] = module;
	
	//
	// determine if the module supports widget and if it does
	// register the widget name
	//
	if (module.isWidget)
	{
		var widgetName = module.getWidgetName().toLowerCase();
		if (Appcelerator.Core.widgets[widgetName])
		{
			throw "duplicate widget name detected: "+widgetName;
		}
		Appcelerator.Core.widgets[widgetName] = module;
	}
	
	//
	// give the module back his path
	// 
	if (typeof(module.setPath)=='function')
	{
		var path = Appcelerator.ModulePath + moduleName + '/';
		module.setPath(path);
	}
	
	//
	//setup unload handler if found in the module
	//
	if (module.onUnload)
	{
		window.observe(window,'unload',module.onUnload);
	}
};

//
// handlers for when document is loaded or unloaded
//
Appcelerator.Core.onloaders = [];
Appcelerator.Core.onunloaders = [];
Appcelerator.Core.onload = function(f,first)
{
	if (first)
	{
		Appcelerator.Core.onloaders.unshift(f);
	}
	else
	{
		Appcelerator.Core.onloaders.push(f);
	}
};

Appcelerator.Core.onunload = function(f)
{
	Appcelerator.Core.onunloaders.push(f);
};

Appcelerator.Core.onloadInvoker = function()
{
	if (!Appcelerator.bootstrapped)
	{
		bootAppcelerator();
	}	
	
	var ts = new Date().getTime();
	
	for (var c=0;c<Appcelerator.Core.onloaders.length;c++)
	{
		Appcelerator.Core.onloaders[c]();
	}
	Appcelerator.Core.onloaders = null;
	
	Logger.info('Appcelerator v'+Appcelerator.Version+' ... loaded in '+(new Date().getTime()-ts)+' ms');
	Logger.info(Appcelerator.Copyright);
	Logger.info(Appcelerator.LicenseMessage);
	Logger.info('Less Code. More App.');
};
Appcelerator.Core.onunloadInvoker = function()
{
	for (var c=0;c<Appcelerator.Core.onunloaders.length;c++)
	{
		Appcelerator.Core.onunloaders[c]();
	}
	Appcelerator.Core.onunloaders = null;
};

Event.observe(window,'load',Appcelerator.Core.onloadInvoker);
Event.observe(window,'unload',Appcelerator.Core.onunloadInvoker);

/**
 * check the browser support before continuing
 */
Appcelerator.Core.onload(function()
{
	if (Appcelerator.Browser.autocheckBrowserSupport && !Appcelerator.Browser.isBrowserSupported)
	{
		document.body.style.display = 'none';
		try
		{
			// attempt to see if we have an upgrade file and if we do
			// just go to it - otherwise, default to just the unsupported text
			new Ajax.Request(Appcelerator.Browser.upgradePath,
			{
				asynchronous:true,
				method:'get',
				onFailure: function(e)
				{
					document.open();
					document.write("<html><head><meta http-equiv='pragma' content='no-cache'></head><body>"+Appcelerator.Browser.unsupportedBrowserMessage+"</body></html>");
					document.close();
					document.body.style.display='';
				},
				onSuccess:function(r)
				{
					// just go to the page directly - makes it cleaner
					document.open();
					document.write(r.responseText);
					document.close();
					document.body.style.display='';
				}
			});
		}
		catch(e)
		{
			document.open();
			document.write("<html><head><meta http-equiv='pragma' content='no-cache'></head><body>"+Appcelerator.Browser.unsupportedBrowserMessage+"</body></html>");
			document.close();
			document.body.style.display='';
		}
	}
});
