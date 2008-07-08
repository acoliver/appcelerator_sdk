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

Appcelerator.Core.onload(function()
{
	Appcelerator.appuid = Appcelerator.Util.Cookie.GetCookie('appuid');
	if (!Appcelerator.appuid)
	{
		Appcelerator.appuid = Appcelerator.Util.UUID.generateNewId() + '-' + new Date().getTime();
		var e = new Date(new Date().getTime() + (Appcelerator.Util.DateTime.ONE_YEAR * 5));
		Appcelerator.Util.Cookie.SetCookie('appuid',Appcelerator.appuid,e,'/');
	}
	var sendRemote = window.location.href.indexOf('file:/')!=-1;
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
		var a = 0, s = 0, v = 1, c = null;

		c = Appcelerator.ServerConfig['aid'];
        if (c) a = c.value;

		c = Appcelerator.ServerConfig['sid'];
        if (c) s = c.value;

        var p = Appcelerator.Browser.isWindows ? 'win' : Appcelerator.Browser.isMac ? 'mac' : Appcelerator.Browser.isLinux ? 'linux' : Appcelerator.Browser.isSunOS ? 'sunos' : 'unknown';
		var f = Appcelerator.Browser.flashVersion;
		var sic = (Appcelerator.ServerConfig['sessionid']||{}).value;
        var si = Appcelerator.Util.Cookie.GetCookie(sic);
		var i = new Image;
		var qs = $H({
			'x-tid': Appcelerator.started.getTime(),
			'x-v':v,
			'x-a':a,
			'x-s':s,
			'x-gg':Appcelerator.Browser.isGears,
			'x-fd':Appcelerator.Browser.isFluid,
			'x-dm':data.screen.width+','+data.screen.height+','+data.screen.color,
			'x-p':platform,
			'x-tz':tz,
			'x-fv':data.flashver,
			'x-sv':data.silverlightver,
			'x-r':document.referrer,
			'x-t':document.title,
			'x-si':si,
			'x-dt':Appcelerator.Util.DateTime.format(time,'c'),
			'x-sct': Appcelerator.compileTime,
			'x-slt': Appcelerator.loadTime,
			'x-appuid': Appcelerator.appuid,
			'x-evt':'1'
		}).toQueryString();
		i.src = 'http://tracker.appcelerator.org/app.gif?t='+Number(new Date)+'&' + qs; 
	},2000 + Math.round(2999*Math.random()));
	Event.observe(window,'unload',function()
	{
		var i = new Image;
		var d = new Date().getTime() - Appcelerator.started.getTime();
		i.src = 'http://tracker.appcelerator.org/app.gif?t='+Number(new Date)+'&x-evt=0&x-appuid=' + Appcelerator.appuid + '&x-d=' + d + '&x-tid=' + Appcelerator.started.getTime(); 
	});
});
