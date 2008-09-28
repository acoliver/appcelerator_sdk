/**
 * Appcelerator Core
 */

// 
// basic initialization for the core
// 
(function()
{
	var baseHref = null;
	var documentRoot = null;
	
	//
	// top is important such that if the JS file is in a different location (hosted)
	// than the primary document, we use the primary document's path (cross site scripting)
	//
	var idx = top.window.document.location.href.lastIndexOf('/');
    if (idx == top.window.document.location.href.length - 1)
    {
    	documentRoot = top.window.document.location.href;
    }
    else
    {
        documentRoot  = top.window.document.location.href.substr(0, idx);
        if (documentRoot.substring(documentRoot.length - 1) != '/')
        {
            documentRoot  = documentRoot + '/';
        }
    }

	$A(document.getElementsByTagName("script")).findAll( function(s) 
	{
	    if (s.src && s.src.match(/appcelerator(-debug){0,1}\.js(\?.*)?$/))
	    {
	    	Appcelerator.jsFileLocation = Appcelerator.URI.absolutizeURI(s.src,documentRoot);
	    	return true;
	    }
	    return false;
	}).each( function(s) 
	{
		Appcelerator.Parameters = $H(s.src.toQueryParams());
	});	

	$A(document.getElementsByTagName("base")).each( function(s) 
	{
		if (s.href)
		{
			baseHref = Appcelerator.URI.absolutizeURI(s.href,documentRoot);
			throw $break;
		}
	});

	if (baseHref)
	{
		Appcelerator.DocumentPath = baseHref;
	}
	else
	{	
		Appcelerator.DocumentPath = documentRoot;
	}
	
	if (Appcelerator.jsFileLocation)
	{
		if (!baseHref)
		{
			// see if it's a full URI
			var hostIdx = Appcelerator.jsFileLocation.indexOf(':/');
			if (hostIdx > 0)
			{
				var jsHostPath = Appcelerator.jsFileLocation.substring(hostIdx + 3, Appcelerator.jsFileLocation.indexOf('/',hostIdx + 4));
				var docIdx = Appcelerator.DocumentPath.indexOf(':/');
				if (docIdx > 0)
				{
					var docHostPath = Appcelerator.DocumentPath.substring(docIdx + 3, Appcelerator.DocumentPath.indexOf('/',docIdx+4));
					if (docHostPath == jsHostPath)
					{
						// if on the same host then always prefer the JS location (one directory up) as the base href
						// such that we can have multiple content directories that include the JS relatively from the top
						Appcelerator.DocumentPath = Appcelerator.URI.absolutizeURI(Appcelerator.jsFileLocation.substring(0,Appcelerator.jsFileLocation.lastIndexOf('/')) + '/../',Appcelerator.DocumentPath);
					}
				}
			}
			else
			{
				// relative URI we need to adjust the DocumentPath
				if (Appcelerator.jsFileLocation.startsWith('/') || Appcelerator.jsFileLocation.startsWith('.'))
				{
					var idx = Appcelerator.jsFileLocation.lastIndexOf('/');
					if (idx!=-1)
					{
						Appcelerator.DocumentPath = Appcelerator.URI.absolutizeURI(Appcelerator.jsFileLocation.substring(0,idx+1) + '../',Appcelerator.DocumentPath);
					}
				}
			}
		}
	}
	else
	{
		Appcelerator.ScriptNotFound = true;
	}
	
	// trim off the ending slash which causes problems for some...
	if (!Appcelerator.DocumentPath.endsWith('/'))
	{
	 	Appcelerator.DocumentPath += '/';
	}
	
    Appcelerator.ScriptPath = Appcelerator.DocumentPath + 'javascripts/';
    Appcelerator.ImagePath = Appcelerator.DocumentPath + 'images/';
    Appcelerator.StylePath = Appcelerator.DocumentPath + 'stylesheets/';
    Appcelerator.ContentPath = Appcelerator.DocumentPath + 'content/';
    Appcelerator.ModulePath = Appcelerator.DocumentPath + 'widgets/';
    Appcelerator.WidgetPath = Appcelerator.DocumentPath + 'widgets/';
	Appcelerator.ComponentPath = Appcelerator.DocumentPath + 'components/';

	if (Appcelerator.jsFileLocation.indexOf('code.appcelerator.org') != -1)
	{
		var codepath = (('https:' == document.location.protocol) ? 'https://s3.amazonaws.com/code.appcelerator.org' : 'http://code.appcelerator.org' );
		Appcelerator.ModulePath = codepath + Appcelerator.Version + '/widgets/';
		Appcelerator.WidgetPath = Appcelerator.ModulePath;
		Appcelerator.ComponentPath = codepath + Appcelerator.Version + '/components/';
	}

    Appcelerator.Parameters = Appcelerator.Parameters.merge(window.location.href.toQueryParams());

	if (Appcelerator.Parameters.get('instanceid'))
	{
		Appcelerator.instanceid = Appcelerator.Parameters.get('instanceid');
	}
	else
	{
		Appcelerator.instanceid = Math.round(9999*Math.random()) + '-' + Math.round(999*Math.random());
	}

	var ua = navigator.userAgent.toLowerCase();
	Appcelerator.Browser.isPreCompiler = (ua.indexOf('Appcelerator Compiler') > -1);
	Appcelerator.Browser.isOpera = (ua.indexOf('opera') > -1);
	Appcelerator.Browser.isSafari = (ua.indexOf('safari') > -1);
	Appcelerator.Browser.isSafari2 = false;
	Appcelerator.Browser.isSafari3 = false;
	Appcelerator.Browser.isIE = !!(window.ActiveXObject);
	Appcelerator.Browser.isIE6 = false;
	Appcelerator.Browser.isIE7 = false;
	Appcelerator.Browser.isIE8 = false;

	if (Appcelerator.Browser.isIE)
	{
		var arVersion = navigator.appVersion.split("MSIE");
		var version = parseFloat(arVersion[1]);
		Appcelerator.Browser.isIE6 = version >= 6.0 && version < 7;
		Appcelerator.Browser.isIE7 = version >= 7.0 && version < 8;
		Appcelerator.Browser.isIE8 = version >= 8.0 && version < 9;
	}

	if (Appcelerator.Browser.isSafari)
	{
		var webKitFields = RegExp("( applewebkit/)([^ ]+)").exec(ua);
		if (webKitFields[2] > 400 && webKitFields[2] < 500)
		{
			Appcelerator.Browser.isSafari2 = true;
		}
		else if (webKitFields[2] > 500 && webKitFields[2] < 600)
		{
			Appcelerator.Browser.isSafari3 = true;
		}
	}

	Appcelerator.Browser.isGecko = !Appcelerator.Browser.isSafari && (ua.indexOf('gecko') > -1);
	Appcelerator.Browser.isCamino = Appcelerator.Browser.isGecko && ua.indexOf('camino') > -1;
	Appcelerator.Browser.isFirefox = Appcelerator.Browser.isGecko && (ua.indexOf('firefox') > -1 || Appcelerator.Browser.isCamino || ua.indexOf('minefield') > -1 || ua.indexOf('granparadiso') > -1 || ua.indexOf('bonecho') > -1);
	Appcelerator.Browser.isIPhone = Appcelerator.Browser.isSafari && ua.indexOf('iphone') > -1;
	Appcelerator.Browser.isMozilla = Appcelerator.Browser.isGecko && ua.indexOf('mozilla/') > -1;
	Appcelerator.Browser.isWebkit = Appcelerator.Browser.isMozilla && Appcelerator.Browser.isGecko && ua.indexOf('applewebkit') > 0;
	Appcelerator.Browser.isSeamonkey = Appcelerator.Browser.isMozilla && ua.indexOf('seamonkey') > -1;
	Appcelerator.Browser.isPrism = Appcelerator.Browser.isMozilla && ua.indexOf('prism/') > 0;
    Appcelerator.Browser.isIceweasel = Appcelerator.Browser.isMozilla && ua.indexOf('iceweasel') > 0;
    Appcelerator.Browser.isEpiphany = Appcelerator.Browser.isMozilla && ua.indexOf('epiphany') > 0;
	Appcelerator.Browser.isFluid = (window.fluid != null);
	Appcelerator.Browser.isGears = (window.google && google.gears) != null;
	Appcelerator.Browser.isChromium = Appcelerator.Browser.isWebkit && ua.indexOf('chrome/') > 0;

	Appcelerator.Browser.isWindows = false;
	Appcelerator.Browser.isMac = false;
	Appcelerator.Browser.isLinux = false;
	Appcelerator.Browser.isSunOS = false;

	var platform = null;

	if(ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1)
	{
	    Appcelerator.Browser.isWindows = true;
		platform = 'win32';
	}
	else if(ua.indexOf("macintosh") != -1 || ua.indexOf('mac os x') != -1)
	{
		Appcelerator.Browser.isMac = true;
		platform = 'mac';
	}
	else if (ua.indexOf('linux')!=-1)
	{
		Appcelerator.Browser.isLinux = true;
		platform = 'linux';
	}
	else if (ua.indexOf('sunos')!=-1)
	{
		Appcelerator.Browser.isSunOS = true;
		platform = 'sun';
	}

	// silverlight detection
	// thanks to http://www.nikhilk.net/Silverlight-Analytics.aspx
    Appcelerator.Browser.isSilverlight = false;
	Appcelerator.Browser.silverlightVersion = 0;
	Event.observe(window,'load',function()
	{
	    var container = null;
	    try {
	        var control = null;
	        if (window.ActiveXObject) {
	            control = new ActiveXObject('AgControl.AgControl');
	        }
	        else {
	            if (navigator.plugins['Silverlight Plug-In']) {
	                container = document.createElement('div');
	                document.body.appendChild(container);
	                container.innerHTML= '<embed type="application/x-silverlight" src="data:," />';
	                control = container.childNodes[0];
	            }
	        }
	        if (control) {
	            if (control.isVersionSupported('2.0')) 
				{ 
					Appcelerator.Browser.silverlightVersion = 2.0; 
				}
	            else if (control.isVersionSupported('1.0')) 
				{ 
					Appcelerator.Browser.silverlightVersion = 1.0; 
				}
				Appcelerator.Browser.isSilverlight = Appcelerator.Browser.silverlightVersion > 0;
	        }
	    }
	    catch (e) { }
	    if (container) {
	        document.body.removeChild(container);
	    }
	});

	// flash detection
	Appcelerator.Browser.isFlash = false;
	Appcelerator.Browser.flashVersion = 0;
	if (Appcelerator.Browser.isIE)
	{
			try
			{
				var flash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
				var ver = flash.GetVariable("$version");
				var idx = ver.indexOf(' ');
				var tokens = ver.substring(idx+1).split(',');
				var version = tokens[0];
				Appcelerator.Browser.flashVersion = parseInt(version);
				Appcelerator.Browser.isFlash = true;
			}
			catch(e)
			{
				// we currently don't support lower than 7 anyway
			}
	}
	else
	{
		var plugin = navigator.plugins && navigator.plugins.length;
		if (plugin)
		{
			 plugin = navigator.plugins["Shockwave Flash"] || navigator.plugins["Shockwave Flash 2.0"];
			 if (plugin)
			 {
				if (plugin.description)
				{
					var ver = plugin.description;
					Appcelerator.Browser.flashVersion = parseInt(ver.charAt(ver.indexOf('.')-1));
					Appcelerator.Browser.isFlash = true;
				}			 	
				else
				{
					// not sure what version... ?
					Appcelerator.Browser.flashVersion = 7;
					Appcelerator.Browser.isFlash = true;
				}
			 }
		}
		else
		{
			plugin = (navigator.mimeTypes && 
		                    navigator.mimeTypes["application/x-shockwave-flash"] &&
		                    navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) ?
		                    navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin : 0;
			if (plugin && plugin.description) 
			{
				Appcelerator.Browser.isFlash = true;
		    	Appcelerator.Browser.flashVersion = parseInt(plugin.description.substring(plugin.description.indexOf(".")-1));
			}
		}
	}
	Appcelerator.Browser.isBrowserSupported = false;
	$w('Firefox IE6 IE7 IE8 Safari Camino Opera Webkit Seamonkey Prism Iceweasel Epiphany').each(function(name)
	{
        if (Appcelerator.Browser['is'+name]===true)
        {
            Appcelerator.Browser.isBrowserSupported=true;
			Event.observe(window,'load',function()
			{
				if (platform) Element.addClassName(document.body,platform);
				Element.addClassName(document.body,name.toLowerCase());
				if (Appcelerator.Browser.isMozilla)
				{
					Element.addClassName(document.body,'mozilla');
				}
				if (Appcelerator.Browser.isIPhone)
				{
					Element.addClassName(document.body,'iphone');
					Element.addClassName(document.body,'webkit');
					Element.addClassName(document.body,'safari');
				}
				if (Appcelerator.Browser.isChromium)
				{
					Element.addClassName(document.body,'chromium');
				}
				if (Appcelerator.Browser.isSafari)
				{
					Element.addClassName(document.body,'webkit');
					if (Appcelerator.Browser.isSafari2)
					{
						Element.addClassName(document.body,'safari2');
					}
					else if (Appcelerator.Browser.isSafari3)
					{
						Element.addClassName(document.body,'safari3');
					}
				}
				else if (Appcelerator.Browser.isGecko)
				{
					Element.addClassName(document.body,'gecko');
				}
				if (Appcelerator.Browser.isFirefox)
				{
					if (ua.indexOf('firefox/3')>0)
					{
						Element.addClassName(document.body,'firefox3');
					}
					else if (ua.indexOf('firefox/2')>0)
					{
						Element.addClassName(document.body,'firefox2');
					}
				}
				else if (Appcelerator.Browser.isIE)
				{
					Element.addClassName(document.body,'msie');
				}
				if (Appcelerator.Browser.isIPhone)
				{
					Element.addClassName(document.body,'width_narrow');
					Element.addClassName(document.body,'height_short');
				}
				else
				{
					function calcDim()
					{
						var cn = Element.classNames(document.body);
						if (cn)
						{
							cn._each(function(name)
							{
								if (name.startsWith('height_') || name.startsWith('width_'))
								{
									cn.remove(name);
								}
							});
						}
                        var width = document.documentElement.clientWidth || window.screen.width;
                        var height = document.documentElement.clientHeight || window.screen.height;

						if (height < 480)
						{
							Element.addClassName(document.body,'height_tiny');
						}
						else if (height >= 480 && height <= 768)
						{
							Element.addClassName(document.body,'height_small');
						}
						else if (height > 768  && height < 1100)
						{
							Element.addClassName(document.body,'height_medium');
						}
						else if (height >= 1100)
						{
							Element.addClassName(document.body,'height_large');
						}
						if (width <= 640)
						{
							Element.addClassName(document.body,'width_tiny');
						}
						else if (width > 640 && width <= 1024)
						{
							Element.addClassName(document.body,'width_small');
						}
						else if (width > 1024 && width <=1280 )
						{
							Element.addClassName(document.body,'width_medium');
						}
						else if (width > 1280)
						{
							Element.addClassName(document.body,'width_large');
						}
					}
					Event.observe(window,'resize',calcDim);
					calcDim();
				}
			});
            throw $break;
        }
	});
	Appcelerator.Browser.unsupportedBrowserMessage = "<h1>Browser Upgrade Required</h1><p>We're sorry, but your browser version is not supported by this application.</p><p>This application requires a modern browser, such as <a href='http://www.getfirefox.com'>Firefox 2.0+</a>, <a href='http://www.apple.com/safari/'>Safari 2.0+</a>, <a href='http://www.microsoft.com/windows/products/winfamily/ie/default.mspx'>Internet Explorer 6.0+</a> or <a href='http://www.opera.com'>Opera 9.0+</a>.</p><p>Your browser reported: <font face='courier'>" + ua + "</font></p>";
	Appcelerator.Browser.upgradePath = Appcelerator.DocumentPath + 'upgrade.html';
})();


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
Appcelerator.Core.requireCommonCSS = function(name,onload,onerror)
{
    var srcpath = Appcelerator.Core.getModuleCommonDirectory()+'/css/'
            
    Appcelerator.Core.requireMultiple(function(path,action)
    {
        Appcelerator.Core.remoteLoadCSS(path,onload,onerror);
    },srcpath,name);
};


/**
 * dynamically load JS from common JS path and call onload once 
 * loaded (or immediately if already loaded)
 *
 * @param {string} name of the common js
 * @param {function} onload function to callback upon load
 */
Appcelerator.Core.requireCommonJS = function(name,onload,onerror)
{
    var srcpath = Appcelerator.Core.getModuleCommonDirectory()+'/js/'
            
    Appcelerator.Core.requireMultiple(function(path,action)
    {
        Appcelerator.Core.remoteLoadScript(path,onload,onerror);
    },srcpath,name);
};

/**
 * internal method for loading multiple files
 */
Appcelerator.Core.requireMultiple = function(invoker,srcpath,name,onload,onerror)
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
                Appcelerator.Core.requireMultiple(invoker,srcpath,name[idx],loader,onerror);                    
            }
        };
        Appcelerator.Core.requireMultiple(invoker,srcpath,name[idx],loader,onerror);                    
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
Appcelerator.Core.remoteLoadScript = function(path,onload,onerror)
{
    Appcelerator.Core.remoteLoad('script','text/javascript',path,onload,onerror);  
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
        Appcelerator.Core.remoteLoad('script', 'text/javascript', script.path, null);
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
Appcelerator.Core.remoteLoadCSS = function(path,onload,onerror)
{
    Appcelerator.Core.remoteLoad('link','text/css',path,onload,onerror);  
};

/**
 * dynamically load a remote file
 *
 * @param {string} name of the tag to insert into the DOM
 * @param {string} type as in content type
 * @param {string} full path to the resource
 * @param {function} onload to invoke upon load
 * @param {function} onerror to invoke upon error
 */
Appcelerator.Core.remoteLoad = function(tag,type,path,onload,onerror)
{
	$D('remoteLoad '+tag+',type='+type+',path='+path+',onload='+onload+',onerror='+onerror);

	// fixup the URI
	path = Appcelerator.URI.absolutizeURI(path,Appcelerator.DocumentPath);
	
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
	var timer = null;
    var loader = function()
    {
	   $D('loaded '+path);
	   if (timer) clearTimeout(timer);
       var callbacks = Appcelerator.Core.fetching[path];
       if (callbacks)
       {
           for (var c=0;c<callbacks.length;c++)
           {
               try { callbacks[c](); } catch (E) { }
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
				if (onerror)
				{
					if (!loaded)
					{
						// max time to determine if we've got an error
						// obviously won't work if takes long than 45 secs to load script
						timer=setTimeout(onerror,45000);
					}
					element.onerror = function()
					{
						// for browsers that support onerror
						if (timer) clearTimeout(timer);
						onerror();
					};
				}
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
Appcelerator.Core.loadJS = function (path, onload, track, onerror)
{
    Appcelerator.Core.remoteLoadScript(path,onload,onerror);
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
Appcelerator.Core.requireModule = function(moduleName,onload,onerror)
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
	for (var c=0;c<Appcelerator.Core.onloaders.length;c++)
	{
		Appcelerator.Core.onloaders[c]();
	} 
	Appcelerator.Core.onloaders = null;
	
	Logger.info('Appcelerator v'+Appcelerator.Version+' ... loaded in '+(new Date().getTime()-Appcelerator.started.getTime())+' ms');
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
        instanceid: Appcelerator.instanceid,
		version: Appcelerator.Version,
		codeServer: 'http://code.appcelerator.org/'
    };
 

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
