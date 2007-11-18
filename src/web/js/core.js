/**
 * Appcelerator Core
 */

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
		Appcelerator.Core.loadJS(path,onload);
	}
	else
	{
		if (typeof onload == 'function') onload();
	}
};

Appcelerator.Core.loadJS = function (path, onload)
{
	// first check to see if we're already fetching this script and if so
	// just add ourselves as a listener to be notified
	var array = Appcelerator.Core.fetching[path];
	if (array)
	{
		if (onload)
		{
			array.push(onload);
		}
		return;
	}
	if (onload)
	{
		Appcelerator.Core.fetching[path]=[onload];
	}
	
	var script = document.createElement('script');
	script.setAttribute('type','text/javascript');
	script.setAttribute('src',path);
	script.onerror = function(e)
	{
		$E('Error loading '+path+'\n Exception: '+Object.getExceptionDetail(e));
	};
	
	Appcelerator.Core.HeadElement.appendChild(script);	
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
		Appcelerator.Compiler.setElementId(link, 'css_'+moduleName);
		
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

		//Refresh css in IE 6/7 because the give priority to css in load order, not document order
		if (Appcelerator.Browser.isIE)
		{
			var link = document.styleSheets[document.styleSheets.length-1].owningElement;
			if (link)
			{
				link.moduleCSS = 1;
			}
			
			var ss = document.styleSheets;
			var arr = [];
			var modarr = [];
			
			try
			{
				for (var i = 0; i < ss.length; i++)
				{
					if (ss[i].owningElement.moduleCSS)
					{
						modarr.push ([ss[i].owningElement,ss[i].owningElement.outerHTML]);
					}
					else
					{
						arr.push ([ss[i].owningElement,ss[i].owningElement.outerHTML]);
					}
				}
			} 
			catch (e) 
			{ 
				throw 'Failed to gather CSS: ' + e.message; 
			}
					
			try
			{
				for (var i = arr.length-1; i >= 0; i--)
				{
					Element.remove(arr[i][0]);
				}
				
				for (var i = modarr.length-1; i >= 0; i--)
				{
					Element.remove(modarr[i][0]);
				}
				
				for (var i = 0; i < modarr.length; i++)
				{
					var elem = document.createElement(modarr[i][1]);
					elem.moduleCSS = 1;
					Appcelerator.Core.HeadElement.appendChild(elem);
				}
							
				for (var i = 0; i < arr.length; i++)
				{
					if(arr[i][0].nodeName == 'STYLE')
					{
						var style = document.createStyleSheet();
						style.cssText = arr[i][0].styleSheet.cssText;
					}
					else 
					{
						var elem = document.createElement(arr[i][1]);
						Appcelerator.Core.HeadElement.appendChild(elem);
					}
				}
			} 
			catch (e) 
			{ 
				throw 'Failed to refresh CSS: ' + e.message; 
			}
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

	var path = Appcelerator.ModulePath + moduleName + '/module.js';	
	var listeners = Appcelerator.Core.fetching[path];
	if (listeners)
	{
		// notify any pending listeners
		for (var c=0;c<listeners.length;c++)
		{
			listeners[c]();
		}
	}
    delete Appcelerator.Core.fetching[path];
};

Appcelerator.Core.registerModuleWithJS = function (moduleName,module,js)
{
    moduleName = moduleName.replace(':','_');
    setTimeout(function()
    {
        Appcelerator.Core.loadAsyncJS(moduleName,module,js,0);
    },0);
};

Appcelerator.Core.loadAsyncJS = function(moduleName,module,array,idx)
{
    if (!array || idx == array.length)
    {
        Appcelerator.Core.registerModule(moduleName, module);
    }
    else
    {
        var path = Appcelerator.ModulePath + moduleName + '/js/' + array[idx];
        new Ajax.Request(path,
        {
            asynchronous:true,
            method:'get',
            evalJS:false,
            onSuccess:function(response)
            {
                try
                {
                    if (Appcelerator.Browser.isSafari)
                    {
                        // global eval is broken in safari so we have to trick it by
                        // adding script tag directly
                        var script_tag = document.createElement('script');
                        script_tag.type = 'text/javascript';
                        script_tag.appendChild(document.createTextNode(response.responseText));
                        Appcelerator.Core.HeadElement.appendChild(script_tag);
                    }
                    else
                    {
                        // window prefix is important here as it will eval on global scope
                        window.eval(response.responseText);
                    }
                }
                catch (e)
                {
                    $E('Error loading '+path+'\n Exception: '+Object.getExceptionDetail(e));
                }
                Appcelerator.Core.loadAsyncJS(moduleName,module,array,idx+1);
            }
        });
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
	var ts = new Date().getTime();
	
	for (var c=0;c<Appcelerator.Core.onloaders.length;c++)
	{
		Appcelerator.Core.onloaders[c]();
	}
	Appcelerator.Core.onloaders = null;
	
	Logger.info('Appcelerator v'+Appcelerator.Version+' ... loaded in '+(new Date().getTime()-ts)+' ms');
	Logger.info(Appcelerator.Copyright);
	Logger.info(Appcelerator.LicenseMessage);
	Logger.info('More App. Less Code.');
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
	if (Appcelerator.Browser.autocheckBrowserSupport && !Appcelerator.Browser.isBrowserSupported && Appcelerator.Config['browser_check'])
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
