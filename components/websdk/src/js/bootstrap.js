/**
 * Appcelerator bootstrap loader
 */

/** THESE CHECKS ARE NEEDED IN CASE THE NON-BUNDLED VERSION OF PROTOTYPE/SCRIPTACULOUS IS USED **/
 
if (typeof Prototype=='undefined')
{
    var msg = 'Required javascript library "Prototype" not found';
    alert(msg);
    throw msg;
}

if (typeof Effect=='undefined')
{
    var msg = 'Required javascript library "Scriptaculous" not found';
    alert(msg);
    throw msg;
}
        

if (Object.isUndefined(window['$sl']))
{
	/**
	 * create a non-conflicting alias to $$
	 */
	window.$sl = function()
	{
	    return Selector.findChildElements(document, $A(arguments));
	}
}
if (Object.isUndefined(window['$el']))
{
	/**
	 * create a non-conflicting alias to $
	 */
	window.$el = eval('window["$"]');
}

var Appcelerator = {};
Appcelerator.Util={};
Appcelerator.Browser={};
Appcelerator.Compiler={};
Appcelerator.Config={};
Appcelerator.Core={};
Appcelerator.Localization={};
Appcelerator.Validator={};
Appcelerator.Decorator={};
Appcelerator.Module={};
Appcelerator.Widget={};
Appcelerator.Shortcuts={}; // please do not touch this

Appcelerator.started = new Date;
Appcelerator.loadTime = -1;
Appcelerator.compileTime = -1;

Appcelerator.Version = 
{
	major: parseInt('${version.major}'),
	minor: parseInt('${version.minor}'),
	revision: parseInt('${version.rev}'),
	toString:function()
	{
		return this.major + "." + this.minor + '.' + this.revision;
	}
};

Appcelerator.LicenseType = 'Apache License Version 2.0 - see http://license.appcelerator.org';
Appcelerator.Copyright = 'Copyright (c) 2006-2008 by Appcelerator, Inc. All Rights Reserved.';
Appcelerator.LicenseMessage = 'Appcelerator is licensed under ' + Appcelerator.LicenseType;
Appcelerator.Parameters = $H({});

// 
// basic initialization for the core
// 
(function()
{
	var baseHref = null;
	
	$A(document.getElementsByTagName("script")).findAll( function(s) 
	{
	    if (s.src && s.src.match(/appcelerator(-debug){0,1}\.js(\?.*)?$/))
	    {
	    	Appcelerator.jsFileLocation = s.src;
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
			baseHref = s.href;
			throw $break;
		}
	});
	
	if (baseHref)
	{
		Appcelerator.DocumentPath = baseHref;
	}
	else
	{
		//
		// top is important such that if the JS file is in a different location (hosted)
		// than the primary document, we use the primary document's path (cross site scripting)
		//
		var idx = top.window.document.location.href.lastIndexOf('/');
	    if (idx == top.window.document.location.href.length - 1)
	    {
	    	Appcelerator.DocumentPath = top.window.document.location.href;
	    }
	    else
	    {
	        Appcelerator.DocumentPath  = top.window.document.location.href.substr(0, idx);
	        if (Appcelerator.DocumentPath.substring(Appcelerator.DocumentPath.length - 1) != '/')
	        {
	            Appcelerator.DocumentPath  = Appcelerator.DocumentPath + '/';
	        }
	    }
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
						Appcelerator.DocumentPath = Appcelerator.jsFileLocation.substring(0,Appcelerator.jsFileLocation.lastIndexOf('/')) + '/../'
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
						Appcelerator.DocumentPath = Appcelerator.jsFileLocation.substring(0,idx+1) + '../';
					}
				}
			}
		}
	}
	else
	{
		Appcelerator.ScriptNotFound = true;
	}
	
    Appcelerator.ScriptPath = Appcelerator.DocumentPath + 'javascripts/';
    Appcelerator.ImagePath = Appcelerator.DocumentPath + 'images/';
    Appcelerator.StylePath = Appcelerator.DocumentPath + 'stylesheets/';
    Appcelerator.ContentPath = Appcelerator.DocumentPath + 'content/';
    Appcelerator.ModulePath = Appcelerator.DocumentPath + 'widgets/';
    Appcelerator.WidgetPath = Appcelerator.DocumentPath + 'widgets/';

	if (Appcelerator.jsFileLocation.indexOf('code.appcelerator.org') != -1)
	{
		var codepath = (('https:' == document.location.protocol) ? 'https://s3.amazonaws.com/code.appcelerator.org' : 'http://code.appcelerator.org' );
		Appcelerator.ModulePath = codepath + Appcelerator.Version + '/widgets/';
		Appcelerator.WidgetPath = Appcelerator.ModulePath;
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

