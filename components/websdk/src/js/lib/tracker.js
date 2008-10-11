// this will simply ping the remote JS but not do anything with it - used for collecting simple usage data (but no personal information)
// and to help us better refine problems, usage data and make the product better - turn it off by simply
// setting AppC.config['track_stats'] = false after loading your appcelerator JS file
var appuid = $.cookie('appuid');
var staturi = (('https:' == document.location.protocol) ? 'https://s3.amazonaws.com/tracker.appcelerator.org/' : 'http://tracker.appcelerator.org/' ) + 'app.js';
if (!appuid)
{
	appuid = App.UUID.newID();
	$.cookie('appuid',appuid,{expires:31536000000 * 5,path:'/',domain:document.domain});
}

var _onerror = window.onerror, _sending = false;

function TrackStat (evt,extra)
{
	if (AppC.config.track_stats)
	{
		_sending = true;
		var d = new Date().getTime() - (started || new Date).getTime();
		var uri = staturi + '?t='+Number(new Date)+'&dur=' + d + '&evt=' + evt + '&appuid=' + appuid + '&tid=' + started.getTime() + '&' + (extra || ''); 
		// this should never be allowed to fail
		try { $.getScript(uri); } catch (E) {}
		_sending = false;
	}
};
var errorCount = 0;
var errorMax = 5;
window.onerror = function(msg,url,line)
{
	// refuse to track our own errors
	if (_sending) return;
	try
	{
		if (url && url.indexOf(staturi)!=-1)
		{
			// don't let tracker errors be a problem either
			return;
		}
		if (errorCount++ > errorMax)
		{
			// refuse to send more than errorMax
			return;
		}
		// squash this event... an event object not an error and we can safely ignore
		if (!url && !line && typeof(msg)=='object' && typeof(msg.stopPropagation)=='function')
		{
			_sending = false;
			return;
		}
		
	    $.error('generic uncaught error = '+String(msg)+', url = '+url+', line = '+line);
		
		// track app errors to improve common issues
		var s = 'msg=' + encodeURIComponent($.encode64(String(msg))) + '&url='+encodeURIComponent($.encode64(String(url||''))) + '&line='+encodeURIComponent(line||-1);
		
		TrackStat(2,s);
		
		// call next guy in chain if one exists
		if (_onerror)
		{
			_onerror(msg,url,line);
		}
	}
	catch(e)
	{
		$.error('caught error in window.onerror = '+e);
		_sending = false;
		return false;
	}
};
/*** FIXME
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
***/

$(document).bind('compiled',function()
{
	var sendRemote = window.location.href.indexOf('file:/')!=-1 && AppC.config.report_stats;
    var screenHeight = screen.height;
    var screenWidth = screen.width;
    var colorDepth = screen.colorDepth || -1;
	var tz = started.getTimezoneOffset()/60;
	var cookies = [];
	
	$.each((document.cookie||'').split(';'),function()
	{
		var t = this.split('=');
		if (t.length > 0) cookies.push({name:t[0],value:t[1]});
	});
	
	var data = 
	{
		'userAgent': navigator.userAgent,
		'flash': AppC.UA.flash,
		'flashver': AppC.UA.flashVersion,
		'silverlight': AppC.UA.silverlight,
		'silverlightver': AppC.UA.silverlightVersion,
		'gears': AppC.UA.gears,
		'fluid': AppC.UA.fluid,
		'screen': {
		    'height':screenHeight,
		    'width':screenWidth,
		    'color':colorDepth
		 },
		'os': AppC.UA.platform,
		'referrer': document.referrer,
		'path': window.location.href,
		'cookies' : cookies,
		'tz' : tz,
		'uid': appuid
	};
	setTimeout(function()
	{
		if (sendRemote)
		{
		    //
		    // if being loaded from an IFrame - don't do the report
		    //
		    if (window.parent == null || window.parent == window)
		    {
	            $(document).pub('r:appcelerator.status.report',data);
		    }
		}
		var a = 0, s = 0, v = 1, c = null, l = null, svc = null;
	
		c = AppC.serverConfig['aid'];
	    if (c) a = c.value;
	
		c = AppC.serverConfig['sid'];
	    if (c) s = c.value;
	
		c = AppC.serverConfig['language'];
		if (c) l = c.value;
	
		c = AppC.serverConfig['service'];
		if (c) svc = c.value;
		
	    var p = AppC.UA.platform || 'unknown';
		var f = AppC.UA.flashVersion;
		var sic = (AppC.serverConfig['sessionid']||{}).value;
	    var si = sic ? $.cookie(sic) : null;

		var qs = $.toQueryString({
			'wv': String(AppC.Version),
			'v': v,
			'a': a,
			's': s,
			'gg': Number(AppC.UA.gears),
			'fd': Number(AppC.UA.fluid),
			'dm': data.screen.width+','+data.screen.height+','+data.screen.color,
			'p': AppC.UA.platform,
			'tz': tz,
			'fv': data.flashver,
			'sv': data.silverlightver,
			'r': $.encode64(document.referrer||''),
			't': $.encode64(document.title||''),
			'si': si,
			'sct': compileTime,
			'slt': loadTime,
			'bl': window.navigator.language,
			'lng': l,
			'svc': svc,
			'js': $.encode64(jsLocation)
		});
		TrackStat(1,qs);
	},2000 + Math.round(1999*Math.random()));
	
	$(window).unload(function()
	{
		TrackStat(0);
	});
});
