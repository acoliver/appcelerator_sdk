
var ua = navigator.userAgent.toLowerCase();

AppC.UA = 
{
	supported:false,
	opera: (ua.indexOf('opera') > -1),
	safari: (ua.indexOf('safari') > -1),
	safari2: false,
	safari3: false,
	IE: !!(window.ActiveXObject),
	IE6: false,
	IE7: false,
	IE8: false,
	windows: false,
	mac: false,
	linux: false,
	sunOS: false,
	platform: 'unknown',
	flash:false,
	flashVersion:0,
	silverlight:false,
	sliverlightVersion:0
};

if (AppC.UA.IE)
{
	var arVersion = navigator.appVersion.split("MSIE");
	var version = parseFloat(arVersion[1]);
	AppC.UA.IE6 = version >= 6.0 && version < 7;
	AppC.UA.IE7 = version >= 7.0 && version < 8;
	AppC.UA.IE8 = version >= 8.0 && version < 9;
}
else if (AppC.UA.safari)
{
	
	var webKitFields = RegExp("( applewebkit/)([^ ]+)").exec(ua);
	if (webKitFields[2] > 400 && webKitFields[2] < 500)
	{
		AppC.UA.safari2 = true;
	}
	else if (webKitFields[2] > 500 && webKitFields[2] < 600)
	{
		AppC.UA.safari3 = true;
	}
}

AppC.UA.gecko = !AppC.UA.safari && (ua.indexOf('gecko') > -1);
AppC.UA.camino = AppC.UA.gecko && ua.indexOf('camino') > -1;
AppC.UA.firefox = AppC.UA.gecko && (ua.indexOf('firefox') > -1 || AppC.UA.camino || ua.indexOf('minefield') > -1 || ua.indexOf('granparadiso') > -1 || ua.indexOf('bonecho') > -1);
AppC.UA.IPhone = AppC.UA.safari && ua.indexOf('iphone') > -1;
AppC.UA.mozilla = AppC.UA.gecko && ua.indexOf('mozilla/') > -1;
AppC.UA.webkit = AppC.UA.mozilla && AppC.UA.gecko && ua.indexOf('applewebkit') > 0;
AppC.UA.seamonkey = AppC.UA.mozilla && ua.indexOf('seamonkey') > -1;
AppC.UA.prism = AppC.UA.mozilla && ua.indexOf('prism/') > 0;
AppC.UA.iceweasel = AppC.UA.mozilla && ua.indexOf('iceweasel') > 0;
AppC.UA.epiphany = AppC.UA.mozilla && ua.indexOf('epiphany') > 0;
AppC.UA.fluid = (window.fluid != null);
AppC.UA.gears = (window.google && google.gears) != null;
AppC.UA.chromium = AppC.UA.webkit && ua.indexOf('chrome/') > 0;


if(ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1)
{
    AppC.UA.windows = true;
	AppC.UA.platform = 'win32';
}
else if(ua.indexOf("macintosh") != -1 || ua.indexOf('mac os x') != -1)
{
	AppC.UA.mac = true;
	AppC.UA.platform = 'mac';
}
else if (ua.indexOf('linux')!=-1)
{
	AppC.UA.linux = true;
	AppC.UA.platform = 'linux';
}
else if (ua.indexOf('sunos')!=-1)
{
	AppC.UA.sunOS = true;
	AppC.UA.platform = 'sun';
}

// silverlight detection
// thanks to http://www.nikhilk.net/Silverlight-Analytics.aspx
AppC.UA.silverlight = false;
AppC.UA.silverlightVersion = 0;

function checkForSilverlight()
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
				AppC.UA.silverlightVersion = 2.0; 
			}
            else if (control.isVersionSupported('1.0')) 
			{ 
				AppC.UA.silverlightVersion = 1.0; 
			}
			AppC.UA.silverlight = AppC.UA.silverlightVersion > 0;
        }
    }
    catch (e) { }
    if (container) {
        try { document.body.removeChild(container) } catch(E){ }
    }
}

// flash detection
if (AppC.UA.IE)
{
		try
		{
			var flash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			var ver = flash.GetVariable("$version");
			var idx = ver.indexOf(' ');
			var tokens = ver.substring(idx+1).split(',');
			var version = tokens[0];
			AppC.UA.flashVersion = parseInt(version);
			AppC.UA.flash = true;
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
				AppC.UA.flashVersion = parseInt(ver.charAt(ver.indexOf('.')-1));
				AppC.UA.flash = true;
			}			 	
			else
			{
				// not sure what version... ?
				AppC.UA.flashVersion = 7;
				AppC.UA.flash = true;
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
			AppC.UA.flash = true;
	    	AppC.UA.flashVersion = parseInt(plugin.description.substring(plugin.description.indexOf(".")-1));
		}
	}
}

$.each('firefox IE6 IE7 IE8 safari chromium webkit opera camino seamonkey prism fluid iceweasel epiphany'.split(' '),function()
{
	if (AppC.UA[this]===true)
	{
		AppC.UA.supported = true;
		var name = this.toLowerCase();
		AppC.beforeCompile(function()
		{
			checkForSilverlight();
			var body = $('body');
			if (AppC.UA.platform) body.addClass(AppC.platform);
			body.addClass(name);
			for (var p in AppC.UA)
			{
				var v = AppC.UA[p];
				if (typeof(v)=='boolean' && v===true && p!='supported' && p!='flash' && p!='silverlight')
				{
					body.addClass(p.toLowerCase());
				}
			}
			if (AppC.UA.IPhone)
			{
				body.addClass('width_narrow');
				body.addClass('height_short');
			}
			else
			{
				function calcDim()
				{
					var cn = body.attr('class');
					if (cn)
					{
						$.each(cn.split(' '),function()
						{
							if (/^(height|width)_/.test(this))
							{
								body.removeClass(this);
							}
						});
					}
                    var width = $(document).width();
                    var height = $(document).height();

					if (height < 480)
					{
						body.addClass('height_tiny');
					}
					else if (height >= 480 && height <= 768)
					{
						body.addClass('height_small');
					}
					else if (height > 768  && height < 1100)
					{
						body.addClass('height_medium');
					}
					else if (height >= 1100)
					{
						body.addClass('height_large');
					}
					if (width <= 640)
					{
						body.addClass('width_tiny');
					}
					else if (width > 640 && width <= 1024)
					{
						body.addClass('width_small');
					}
					else if (width > 1024 && width <=1280 )
					{
						body.addClass('width_medium');
					}
					else if (width > 1280)
					{
						body.addClass('width_large');
					}
				}
				$(window).bind('resize',calcDim);
				calcDim();
			}
		});
		return false; // once we have a supported browser, just break out
	}
});

//FIXME: browser not supported work
