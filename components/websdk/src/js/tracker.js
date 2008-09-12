Appcelerator.appuid = Appcelerator.Util.Cookie.GetCookie('appuid');
Appcelerator.StatsURI = (('https:' == document.location.protocol) ? 'https://s3.amazonaws.com/tracker.appcelerator.org/' : 'http://tracker.appcelerator.org/' ) + 'app.gif';

if (!Appcelerator.appuid)
{
	Appcelerator.appuid = Appcelerator.Util.UUID.generateNewId();
	var e = new Date(new Date().getTime() + (Appcelerator.Util.DateTime.ONE_YEAR * 5));
	Appcelerator.Util.Cookie.SetCookie('appuid',Appcelerator.appuid,e,'/');
}

Appcelerator.Compiler.beforeDocumentCompile(function()
{
	Appcelerator.compileStarted = new Date;
});

Appcelerator.Compiler.afterDocumentCompile(function()
{
	var D = new Date().getTime();
	Appcelerator.compileTime = D - Appcelerator.compileStarted.getTime();
	Appcelerator.loadTime = D - Appcelerator.started.getTime(); 
});

if (window.onerror)
{
	Appcelerator._onerror = window.onerror;
}

Appcelerator.TrackStat = function(evt,extra)
{
	if (Appcelerator.Config['track_stats'])
	{
		try
		{
			var i = new Image;
			var d = new Date().getTime() - (Appcelerator.started || new Date).getTime();
			i.src = Appcelerator.StatsURI + '?t='+Number(new Date)+'&dur=' + d + '&evt=' + evt + '&appuid=' + Appcelerator.appuid + '&tid=' + Appcelerator.started.getTime() + '&' + (extra || ''); 
		}
		catch(e)
		{
		}	
	}
};

window.onerror = function(msg,url,line)
{
	try
	{
		Logger.error('generic uncaught error = '+msg+', url = '+url+', line = '+line);
		
		// track app errors to improve common issues
		var s = 'msg=' + encodeURIComponent(String(msg).encode64()) + '&url='+encodeURIComponent(String(url||'').encode64()) + '&line='+encodeURIComponent(line||-1);
		
		(function() { Appcelerator.TrackStat(2,s) }).defer();
		
		// call next guy in chain if one exists
		if (Appcelerator._onerror)
		{
			Appcelerator._onerror(msg,url,line);
		}
	}
	catch(e)
	{
		return false;
	}
};

// install logging handlers that will help track common app problems
(function()
{
	var oldError = Logger.error;
	var oldFatal = Logger.fatal;
	Logger.error = function(msg)
	{
		var m = (String(Object.isArray(msg) ? msg.join(',') : msg)).encode64();
		var s = 'x-lvl=e&x-msg=' + encodeURIComponent(m);
		Appcelerator.TrackStat(3,s);
		return oldError(msg);
	};
	Logger.fatal = function(msg)
	{
		var m = (String(Object.isArray(msg) ? msg.join(',') : msg)).encode64();
		var s = 'x-lvl=f&x-msg=' + encodeURIComponent(m);
		Appcelerator.TrackStat(3,s);
		return oldFatal(msg);
	};
})();


Appcelerator.Core.onload(function()
{
	var sendRemote = window.location.href.indexOf('file:/')!=-1;
    var screenHeight = screen.height;
    var screenWidth = screen.width;
    var colorDepth = screen.colorDepth || -1;
	var tz = Appcelerator.started.getTimezoneOffset()/60;
    var platform = Appcelerator.Browser.isWindows ? 'win' : Appcelerator.Browser.isMac ? 'mac' : Appcelerator.Browser.isLinux ? 'linux' : Appcelerator.Browser.isSunOS ? 'sunos' : 'unknown';
    var data = 
    {
        'userAgent': navigator.userAgent,
        'flash': Appcelerator.Browser.isFlash,
        'flashver': Appcelerator.Browser.flashVersion,
		'silverlight': Appcelerator.Browser.isSilverlight,
		'silverlightver': Appcelerator.Browser.silverlightVersion,
		'gears': Appcelerator.Browser.isGears,
		'fluid': Appcelerator.Browser.isFluid,
        'screen': {
            'height':screenHeight,
            'width':screenWidth,
            'color':colorDepth
         },
        'os': platform,
        'referrer': document.referrer,
        'path': window.location.href,
        'cookies' : (document.cookie||'').split(';').collect(function(f){ var t = f.split('='); return t && t.length > 0 ? {name:t[0],value:t[1]} : {name:null,value:null}}),
        'tz' : tz,
		'uid': Appcelerator.appuid
    };
	if (sendRemote)
	{
		Appcelerator.Util.ServerConfig.addConfigListener(function()
		{
		    //
		    // if being loaded from an IFrame - don't do the report
		    //
		    if (window.parent == null || window.parent == window && Appcelerator.Browser.autoReportStats)
		    {
	            $MQ('remote:appcelerator.status.report',data);
		    }
		});
	}
	setTimeout(function()
	{
		var a = 0, s = 0, v = 1, c = null, l = null, svc = null;

		c = Appcelerator.ServerConfig['aid'];
        if (c) a = c.value;

		c = Appcelerator.ServerConfig['sid'];
        if (c) s = c.value;

		c = Appcelerator.ServerConfig['language'];
		if (c) l = c.value;

		c = Appcelerator.ServerConfig['service'];
		if (c) svc = c.value;
		
        var p = Appcelerator.Browser.isWindows ? 'win' : Appcelerator.Browser.isMac ? 'mac' : Appcelerator.Browser.isLinux ? 'linux' : Appcelerator.Browser.isSunOS ? 'sunos' : 'unknown';
		var f = Appcelerator.Browser.flashVersion;
		var sic = (Appcelerator.ServerConfig['sessionid']||{}).value;
        var si = Appcelerator.Util.Cookie.GetCookie(sic);
		var i = new Image;
		var qs = $H({
			'wv': String(Appcelerator.Version),
			'v': v,
			'a': a,
			's': s,
			'gg': Number(Appcelerator.Browser.isGears),
			'fd': Number(Appcelerator.Browser.isFluid),
			'dm': data.screen.width+','+data.screen.height+','+data.screen.color,
			'p': platform,
			'tz': tz,
			'fv': data.flashver,
			'sv': data.silverlightver,
			'r': String(document.referrer||'').encode64(),
			't': String(document.title||'').encode64(),
			'si': si,
			'sct': Appcelerator.compileTime,
			'slt': Appcelerator.loadTime,
			'bl': window.navigator.language,
			'lng': l,
			'svc': svc,
			'js': String(Appcelerator.jsFileLocation).encode64()
		}).toQueryString();
		Appcelerator.TrackStat(1,qs);
		
	},2000 + Math.round(1999*Math.random()));
	Event.observe(window,'unload',function()
	{
		Appcelerator.TrackStat(0);
	});
});
