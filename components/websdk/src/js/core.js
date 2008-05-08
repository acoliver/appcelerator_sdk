/**
 * Appcelerator Core
 */

Appcelerator.Core.usedModules = {};
Appcelerator.Core.modules = [];
Appcelerator.Core.loadedFiles = {};
Appcelerator.Core.fetching = {};
Appcelerator.Core.widgets = {};
Appcelerator.Core.widgets_css = {};
Appcelerator.Core.widgets_js = {};
Appcelerator.Core.moduleLoaderCallbacks = {};
Appcelerator.Core.script_count = 0;
Appcelerator.Core.scriptWithDependenciesQueue = [];
Appcelerator.Core.scriptWithDependenciesCallback;

Appcelerator.Core.HeadElement = document.getElementsByTagName('head')[0];

/**
 * dynamically load CSS from common CSS path and call onload once 
 * loaded (or immediately if already loaded)
 *
 * @param {string} name of the common file
 * @param {function} onload function to invoke
 */
Appcelerator.Core.requireCommonCSS = function(name,onload)
{
    var srcpath = Appcelerator.Core.getModuleCommonDirectory()+'/css/'
            
    Appcelerator.Core.requireMultiple(function(path,action)
    {
        Appcelerator.Core.remoteLoadCSS(path,onload);
    },srcpath,name);
};


/**
 * dynamically load JS from common JS path and call onload once 
 * loaded (or immediately if already loaded)
 *
 * @param {string} name of the common js
 * @param {function} onload function to callback upon load
 */
Appcelerator.Core.requireCommonJS = function(name,onload)
{
    var srcpath = Appcelerator.Core.getModuleCommonDirectory()+'/js/'
            
    Appcelerator.Core.requireMultiple(function(path,action)
    {
        Appcelerator.Core.remoteLoadScript(path,onload);
    },srcpath,name);
};

/**
 * internal method for loading multiple files
 */
Appcelerator.Core.requireMultiple = function(invoker,srcpath,name,onload)
{
    if (Object.isUndefined(name))
    {
        if (Object.isFunction(onload)) onload();
        return;
    }
    if (Object.isArray(name))
    {
        name = name.compact();
        var idx = 0;
        var loader = function()
        {
            idx++;
            if (idx == name.length)
            {
                if (Object.isFunction(onload)) onload();
            }
            else
            {
                Appcelerator.Core.requireMultiple(invoker,srcpath,name[idx],loader);                    
            }
        };
        Appcelerator.Core.requireMultiple(invoker,srcpath,name[idx],loader);                    
    }
    else
    {
        var path = srcpath+name;
        var loaded = Appcelerator.Core.loadedFiles[path];
        if (loaded)
        {
            if (Object.isFunction(onload)) onload();
        }
        else
        {
            invoker(path,function()
            {
                Appcelerator.Core.loadedFiles[path]=true;
                if (Object.isFunction(onload)) onload();
            });
        }
    }
};

/**
 * dynamically load a javascript file
 *
 * @param {string} path to resource
 * @param {function} onload function to execute once loaded
 */
Appcelerator.Core.remoteLoadScript = function(path,onload)
{
    Appcelerator.Core.remoteLoad('script','text/javascript',path,onload);  
};

/**
 * dynamically laod a javascript file with dependencies
 * this will not call the callback until all resources are loaded
 * multiple calls to this method are queued
 * 
 * @param {string} path to resource
 * @param {function} the string representation of the callback
 */
Appcelerator.Core.queueRemoteLoadScriptWithDependencies = function(path, onload) 
{
    Appcelerator.Core.scriptWithDependenciesQueue.push({'path': path, 'onload': onload});
    Appcelerator.Core.remoteLoadScriptWithDependencies();
};

Appcelerator.Core.remoteLoadScriptWithDependencies = function() 
{
    if(0 < Appcelerator.Core.scriptWithDependenciesQueue.length) 
    {
        var script = Appcelerator.Core.scriptWithDependenciesQueue[0];
        Appcelerator.Core.remoteLoad('script', 'text/javascript', script.path, function() {});
        Appcelerator.Core.scriptWithDependenciesCallback = function() 
        {
            script.onload();
            Appcelerator.Core.scriptWithDependenciesQueue.shift();
            Appcelerator.Core.remoteLoadScriptWithDependencies();
        }
    }
};

/**
 * dynamically load a css file
 *
 * @param {string} path to resource
 * @param {function} onload function to execute once loaded
 */
Appcelerator.Core.remoteLoadCSS = function(path,onload)
{
    Appcelerator.Core.remoteLoad('link','text/css',path,onload);  
};


/**
 * dynamically load a remote file
 *
 * @param {string} name of the tag to insert into the DOM
 * @param {string} type as in content type
 * @param {string} full path to the resource
 * @param {function} onload to invoke upon load
 */
Appcelerator.Core.remoteLoad = function(tag,type,path,onload)
{
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
    var element = document.createElement(tag);
    element.setAttribute('type',type);
    switch(tag)
    {
        case 'script':
            element.setAttribute('src',path);
            break;
        case 'link':
            element.setAttribute('href',path);
            element.setAttribute('rel','stylesheet');
            break;
    }
    var loader = function()
    {
       var callbacks = Appcelerator.Core.fetching[path];
       if (callbacks)
       {
           for (var c=0;c<callbacks.length;c++)
           {
               callbacks[c]();
           }
           delete Appcelerator.Core.fetching[path];
       }
    };    
    if (tag == 'script')
    {
	    if (Appcelerator.Browser.isSafari2)
	    {
	        //this is a hack because we can't determine in safari 2
	        //when the script has finished loading
	        loader.delay(1.5);
	    }
	    else
	    {
	        (function()
	        {
	            var loaded = false;
	            element.onload = loader;
	            element.onreadystatechange = function()
	            {
	                switch(this.readyState)
	                {
	                    case 'loaded':   // state when loaded first time
	                    case 'complete': // state when loaded from cache
	                        break;
	                    default:
	                        return;
	                }
	                if (loaded) return;
	                loaded = true;
	                
	                // prevent memory leak
	                this.onreadystatechange = null;
	                loader();
	            }   
	        })();
	    }   
	}
	else
	{
	   loader.defer();
	}
    Appcelerator.Core.HeadElement.appendChild(element);
};

//
// dynamically load JS from path and call onload once 
// loaded (or immediately if already loaded)
//
Appcelerator.Core.loadJS = function (path, onload, track)
{
    Appcelerator.Core.remoteLoadScript(path,onload);
};

//
// return the module common directory
//
Appcelerator.Core.getModuleCommonDirectory = function ()
{
    return Appcelerator.ModulePath + 'common';
};

//
// called to load a css file relative to the modules/common/css directory
//
Appcelerator.Core.loadModuleCommonCSS = function(moduleName,css)
{
    Appcelerator.Core.loadModuleCSS(moduleName,css,Appcelerator.Core.getModuleCommonDirectory()+'/css')
};

//
// called to load a css file relative to the module css directory
//
Appcelerator.Core.loadModuleCSS = function(moduleName,css,csspath)
{
	moduleName = Appcelerator.Core.getModuleNameFromTag(moduleName);
	
	var loaded = Appcelerator.Core.modules[moduleName];
	if (loaded)
	{
	   throw 'module already loaded when loadModuleCSS is called. Call loadModuleCSS *before* you call registerModule for '+moduleName+' and css: '+css;
	}
	
	var path = csspath ? csspath + '/' + css : Appcelerator.ModulePath + moduleName + '/css/' + css;

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
		/*
		if (Appcelerator.Browser.isIE)
		{
		    // fun with IE, crashes in IE6 is you do this on the same thread so we 
		    // have to give it up
		    setTimeout(function()
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
	                    if(arr[i][0].tagName == 'STYLE')
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
		    },100);
		}*/
	}
};


Appcelerator.Core.getModuleNameFromTag=function(moduleName)
{
	return moduleName.replace(':','_');
};

/**
 * require a module and call onload when it is loaded and registered
 * 
 * @param {string} name of the module (for example, app:script)
 * @param {function} function to call upon loading *and* registering the module
 */
Appcelerator.Core.requireModule = function(moduleName,onload)
{
	var moduleName = Appcelerator.Core.getModuleNameFromTag(moduleName);
	var module = Appcelerator.Core.modules[moduleName];
	
	// already loaded
	if (module)
	{
		onload();
		return;
	}
	
	// already in the process of loading
	var callbacks = Appcelerator.Core.moduleLoaderCallbacks[moduleName];
	if (!callbacks)
	{
		callbacks=[];
		Appcelerator.Core.moduleLoaderCallbacks[moduleName]=callbacks;
		callbacks.push(onload);
	}
	else
	{
		callbacks.push(onload);
		return;
	}
	
	// module needs to be loaded
	var path = Appcelerator.ModulePath + moduleName + '/' + moduleName + '.js';
	Appcelerator.Core.loadJS(path);
};

// map forward to widget
Appcelerator.Core.requireWidget = Appcelerator.Core.requireModule;

/**
 * Modules must call this to register themselves with the framework
 *
 * @param {string} modulename
 * @param {object} module object
 * @param {boolean} dynamic
 */
Appcelerator.Core.registerModule = function (moduleName,module,dynamic)
{
	moduleName = Appcelerator.Core.getModuleNameFromTag(moduleName);
	
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
    //setup unload handler if found in the module
    //
    if (module.onUnload)
    {
        window.observe(window,'unload',module.onUnload);
    }

	//
	// give the module back his path
	// 
	if (typeof(module.setPath)=='function')
	{
		var path = Appcelerator.ModulePath + moduleName + '/';
		module.setPath(path);
	}
	
	var path = Appcelerator.ModulePath + moduleName + '/' + moduleName + '.js';	
	
	var listeners = (Appcelerator.Core.fetching[path] || [] ).concat(Appcelerator.Core.moduleLoaderCallbacks[moduleName]||[]);
	
	if (listeners)
	{
		// notify any pending listeners
		for (var c=0;c<listeners.length;c++)
		{
			listeners[c]();
		}
	}

	delete Appcelerator.Core.moduleLoaderCallbacks[moduleName];
    delete Appcelerator.Core.fetching[path];
};

if (Appcelerator.Browser.isIE)
{
    //
    // special loader function for IE which seems to load async when
    // you loop over multiple scripts and add to DOM - this will ensure
    // that only one JS is loaded in order 
    // 
	Appcelerator.Core.registerModuleWithJSInIE = function(moduleName,module,js,idx,jspath)
	{
	    var file = js[idx];
	    moduleName = Appcelerator.Core.getModuleNameFromTag(moduleName);
	    var path = jspath ? jspath + '/' + file : Appcelerator.ModulePath + moduleName + '/js/' + file;

	    var script = document.createElement('script');
	    script.setAttribute('type','text/javascript');
	    script.setAttribute('src',path);
	    script.onerror = function(e)
	    {
	        $E('Error loading '+path+'\n Exception: '+Object.getExceptionDetail(e));
	    };
	    var loaded = false;
	    script.onreadystatechange = function()
	    {
	        switch(this.readyState)
	        {
	            case 'loaded':   // state when loaded first time
	            case 'complete': // state when loaded from cache
	                break;
	            default:
	                return;
	        }
	        if (loaded) return;
	        loaded = true;
	        
	        // prevent memory leak
	        this.onreadystatechange = null;

	        idx=idx+1;
	        
	        if (idx == js.length)
	        {
	            // do something
	            Appcelerator.Core.registerModule(moduleName, module);
	        }
	        else
	        {
	            // continue to the next one
	            Appcelerator.Core.registerModuleWithJSInIE(moduleName,module,js,idx,jspath);
	        }
	    };
        Appcelerator.Core.HeadElement.appendChild(script);
	};
}
// map forward
Appcelerator.Core.registerWidget = Appcelerator.Core.registerModule; 

/**
 * called to load a js file relative to the modules/common/js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js file(s)
 */
Appcelerator.Core.registerModuleWithCommonJS = function (moduleName,module,js)
{
    Appcelerator.Core.registerModuleWithJS(moduleName,module,js,Appcelerator.Core.getModuleCommonDirectory()+'/js');
};

// map forward
Appcelerator.Core.registerWidgetWithCommonJS = Appcelerator.Core.registerModuleWithCommonJS;

/**
 * called to load a js file relative to the module js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js files(s)
 * @param {string} js path
 */
Appcelerator.Core.registerModuleWithJS = function (moduleName,module,js,jspath)
{
    moduleName = Appcelerator.Core.getModuleNameFromTag(moduleName);
    
    if (Appcelerator.Browser.isIE)
    {
        Appcelerator.Core.registerModuleWithJSInIE(moduleName,module,js,0,jspath);
        return;
    }
    
    var state = 
    {
        count : js.length
    };
    
    var checkState = function()
    {
        state.count--;
        if (state.count==0)
        {
            Appcelerator.Core.registerModule(moduleName, module);
        }
    };
    
    var orderedLoad = function(i)
    {
        var file = js[i];
        var path = !Object.isUndefined(jspath) ? (jspath + '/' + file) : Appcelerator.ModulePath + moduleName + '/js/' + file;

        var script = document.createElement('script');
        script.setAttribute('type','text/javascript');
        script.setAttribute('src',path);
        script.onerror = function(e)
        {
            $E('Error loading '+path+'\n Exception: '+Object.getExceptionDetail(e));
        };
        if (Appcelerator.Browser.isSafari2)
        {
            //this is a hack because we can't determine in safari 2
            //when the script has finished loading
            checkState.delay(2);
        }
        else
        {
	        var loaded = false;
	        
	        if(!Appcelerator.Browser.isOpera) 
            {
                script.onload = checkState; 
            }
            
	        script.onreadystatechange = function()
	        {
	            switch(this.readyState)
	            {
	                case 'loaded':   // state when loaded first time
	                case 'complete': // state when loaded from cache
	                    break;
	                default:
	                    return;
	            }
	            if (loaded) return;
	            loaded = true;
	            
	            // prevent memory leak
	            this.onreadystatechange = null;
	            checkState.defer();
            }	
        }
        Appcelerator.Core.HeadElement.appendChild(script);
        
        if(i+1 < js.length)
        {
            orderedLoad.delay(0, i+1);
        }
    };
    orderedLoad(0);
};

Appcelerator.Core.registerWidgetWithJS = Appcelerator.Core.registerModuleWithJS;


Appcelerator.Core.getLoadedModulesAndAttributes = function() 
{
    return $H(Appcelerator.Module).map(function(kv){
		return [kv[1].getWidgetName(), kv[1].getAttributes().pluck('name')];
	});
};

//
// handlers for when document is loaded or unloaded
//
Appcelerator.Core.onloaders = [];
Appcelerator.Core.onunloaders = [];

/**
 * function for adding f as listener for when the document is loaded
 *
 * @param {function} function to call onload
 * @param {boolean} add to the head or at the end of the stack
 */
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

/**
 * function for adding f as unload listener when the document is unloaded
 *
 * @param {function} function to call on unload
 */
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
    Appcelerator.TEMPLATE_VARS =
    {
        rootPath: Appcelerator.DocumentPath,
        scriptPath: Appcelerator.ScriptPath,
        imagePath: Appcelerator.ImagePath,
        cssPath: Appcelerator.StylePath,
        contentPath: Appcelerator.ContentPath,
        modulePath: Appcelerator.ModulePath,
        instanceid: Appcelerator.instanceid
    };


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
    
    //Override document.write
    Appcelerator.Core.old_document_write = document.write;
    document.write = function(src) {
        var re = /src=('([^']*)'|"([^"]*)")/gm;
        re.lastIndex = 0;
        var match = re.exec(src);
        if(match) {
            match = match[2] || match[3];
            //This is for some thing that prototype does.  Without it, 
            //IE6 will crash
            if (match == "//:") 
            {
                Appcelerator.Core.old_document_write(src);
            }
            else 
            {
                Appcelerator.Core.script_count++;
                Appcelerator.Core.remoteLoadScript(match, function(){
                    Appcelerator.Core.script_count--;
                    if (0 == Appcelerator.Core.script_count) {
                        Appcelerator.Core.scriptWithDependenciesCallback();
                    }
                });
            }
        }
    };
});
