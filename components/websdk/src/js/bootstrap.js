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

Appcelerator.LicenseType = 'GNU Public License (GPL), version 3.0 or later';
Appcelerator.Copyright = 'Copyright (c) 2006-2008 by Appcelerator, Inc. All Rights Reserved.';
Appcelerator.LicenseMessage = 'Appcelerator is licensed under ' + Appcelerator.LicenseType;
Appcelerator.Parameters = $H({});

// 
// basic initialization for the core
// 
(function()
{
	if (window.AppceleratorConfig)
	{
		Appcelerator.Config = window.AppceleratorConfig;
	}
	else
	{
		Appcelerator.Config['cookie_check'] = false;
		Appcelerator.Config['browser_check'] = true;
		Appcelerator.Config['hide_body'] = false;		
	}
	
	var jsFileLocation = null;
	
	$A(document.getElementsByTagName("script")).findAll( function(s) 
	{
	    if (s.src && s.src.match(/appcelerator(-debug){0,1}\.js(\?.*)?$/))
	    {
	    	jsFileLocation = s.src;
	    	return true;
	    }
	    return false;
	}).each( function(s) 
	{
		Appcelerator.Parameters = $H(s.src.toQueryParams());
	});	
	
    var idx = window.document.location.href.lastIndexOf('/');
    if (idx == window.document.location.href.length - 1)
    {
    	Appcelerator.DocumentPath = window.document.location.href;
    }
    else
    {
        Appcelerator.DocumentPath  = window.document.location.href.substr(0, idx);
        if (Appcelerator.DocumentPath.substring(Appcelerator.DocumentPath.length - 1) != '/')
        {
            Appcelerator.DocumentPath  = Appcelerator.DocumentPath + '/';
        }
    }

	//
	// this check will determine if the JS file (and related structure)
	// is in a different directory than our document and if so, make the
	// document path and our assets relative to where appcelerator JS is loaded
	//
	if (jsFileLocation)
	{
		idx = jsFileLocation.lastIndexOf('/');
		jsFileLocation = jsFileLocation.substring(0,idx);
		if (jsFileLocation!=Appcelerator.DocumentPath+'js')
		{
			idx = jsFileLocation.lastIndexOf('/');
			var newpath = jsFileLocation.substring(0,idx+1);
			if (newpath)
			{
			    Appcelerator.DocumentPath = newpath;
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
	
    Appcelerator.Parameters.merge(window.location.href.toQueryParams());
    
	if (Appcelerator.Parameters['instanceid'])
	{
		Appcelerator.instanceid = Appcelerator.Parameters['instanceid'];
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
	Appcelerator.Browser.isIE = (window.ActiveXObject);
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
	}

	Appcelerator.Browser.isGecko = !Appcelerator.Browser.isSafari && (ua.indexOf('gecko') > -1);
	Appcelerator.Browser.isCamino = Appcelerator.Browser.isGecko && ua.indexOf('camino') > -1;
	Appcelerator.Browser.isFirefox = Appcelerator.Browser.isGecko && (ua.indexOf('firefox') > -1 || ua.indexOf('minefield') > -1 || Appcelerator.Browser.isCamino || ua.indexOf('granparadiso'));
	Appcelerator.Browser.isIPhone = Appcelerator.Browser.isSafari && ua.indexOf('iphone') > -1;
	Appcelerator.Browser.isMozilla = Appcelerator.Browser.isGecko && ua.indexOf('mozilla/') > -1;
	Appcelerator.Browser.isWebkit = Appcelerator.Browser.isMozilla && Appcelerator.Browser.isGecko && ua.indexOf('applewebkit') > 0;
	Appcelerator.Browser.isSeamonkey = Appcelerator.Browser.isMozilla && ua.indexOf('seamonkey') > -1;
	Appcelerator.Browser.isPrism = Appcelerator.Browser.isMozilla && ua.indexOf('prism/') > 0;
    Appcelerator.Browser.isIceweasel = Appcelerator.Browser.isMozilla && ua.indexOf('iceweasel') > 0;
    Appcelerator.Browser.isEpiphany = Appcelerator.Browser.isMozilla && ua.indexOf('epiphany') > 0;
    
	Appcelerator.Browser.isWindows = false;
	Appcelerator.Browser.isMac = false;
	Appcelerator.Browser.isLinux = false;
	Appcelerator.Browser.isSunOS = false;

	if(ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1)
	{
	    Appcelerator.Browser.isWindows = true;
	}
	else if(ua.indexOf("macintosh") != -1 || ua.indexOf('mac os x') != -1)
	{
		Appcelerator.Browser.isMac = true;
	}
	else if (ua.indexOf('linux')!=-1)
	{
		Appcelerator.Browser.isLinux = true;
	}
	else if (ua.indexOf('sunos')!=-1)
	{
		Appcelerator.Browser.isSunOS = true;
	}
	
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
            throw $break;    	   
        }
	});
	Appcelerator.Browser.unsupportedBrowserMessage = "<h1>Browser Upgrade Required</h1><p>We're sorry, but your browser version is not supported by this application.</p><p>This application requires a modern browser, such as <a href='http://www.getfirefox.com'>Firefox 2.0+</a>, <a href='http://www.apple.com/safari/'>Safari 2.0+</a>, <a href='http://www.microsoft.com/windows/products/winfamily/ie/default.mspx'>Internet Explorer 6.0+</a> or <a href='http://www.opera.com'>Opera 9.0+</a>.</p><p>Your browser reported: <font face='courier'>" + ua + "</font></p>";
	Appcelerator.Browser.upgradePath = Appcelerator.DocumentPath + 'upgrade.html';
	Appcelerator.Browser.autocheckBrowserSupport = true;
	Appcelerator.Browser.autoReportStats = true;
})();

