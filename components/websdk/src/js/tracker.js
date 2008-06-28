if (window.location.href.indexOf('file:/')==-1)
{
	Appcelerator.Util.ServerConfig.addConfigListener(function()
	{
        var screenHeight = screen.height;
        var screenWidth = screen.width;
        var colorDepth = screen.colorDepth || -1;
        var time = new Date();
		var tz = time.getTimezoneOffset()/60;
        var platform = Appcelerator.Browser.isWindows ? 'win' : Appcelerator.Browser.isMac ? 'mac' : Appcelerator.Browser.isLinux ? 'linux' : Appcelerator.Browser.isSunOS ? 'sunos' : 'unknown';
        var data = 
        {
            'userAgent': navigator.userAgent,
            'flash': Appcelerator.Browser.isFlash,
            'flashver': Appcelerator.Browser.flashVersion,
			'silverlight': Appcelerator.Browser.isSilverlight,
			'silverlightver': Appcelerator.Browser.silverlightVersion,
            'screen': {
                'height':screenHeight,
                'width':screenWidth,
                'color':colorDepth
             },
            'os': platform,
            'referrer': document.referrer,
            'path': window.location.href,
            'cookies' : (document.cookie||'').split(';').collect(function(f){ var t = f.split('='); return t && t.length > 0 ? {name:t[0],value:t[1]} : {name:null,value:null}}),
            'tz' : tz
        };

	    //
	    // if being loaded from an IFrame - don't do the report
	    //
	    if (window.parent == null || window.parent == window && Appcelerator.Browser.autoReportStats)
	    {
            $MQ('remote:appcelerator.status.report',data);
	    }
		
		setTimeout(function()
		{
			var a = 0, s = 0, v = 1, c = null;

			c = Appcelerator.ServerConfig['aid'];
	        if (c) a = c.value;

			c = Appcelerator.ServerConfig['sid'];
	        if (c) s = c.value;

	        var p = Appcelerator.Browser.isWindows ? 'win' : Appcelerator.Browser.isMac ? 'mac' : Appcelerator.Browser.isLinux ? 'linux' : Appcelerator.Browser.isSunOS ? 'sunos' : 'unknown';
			var f = Appcelerator.Browser.flashVersion;

			var i = new Image;
			var qs = $H({
				'x-v':v,
				'x-a':a,
				'x-s':s,
				'x-dm':data.screen.width+','+data.screen.height+','+data.screen.color,
				'x-p':platform,
				'x-tz':tz,
				'x-fv':data.flashver,
				'x-sv':data.silverlightver,
				'x-r':document.referrer,
				'x-t':document.title,
				'x-dt':Appcelerator.Util.DateTime.format(time,'c')
			}).toQueryString();
			i.src = 'http://tracker.appcelerator.org/app.gif?t='+Number(new Date)+'&' + qs; 
		},1000 + Math.round(2999*Math.random()));
	});
}