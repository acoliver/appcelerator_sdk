
var APPCELERATOR_DEBUG = window.location.href.indexOf('debug=1') > 0 || Appcelerator.Parameters['debug']=='1';

var Logger = Class.create();
var _logAppender = null;
var _logEnabled = true;

if (typeof(log4javascript)!='undefined')
{
	log4javascript.setEnabled(APPCELERATOR_DEBUG);

	var _log = log4javascript.getLogger("main");
	if (APPCELERATOR_DEBUG)
	{
	    _logAppender = new log4javascript.PopUpAppender();
	}
	if (_logAppender != null)
	{
	    var _popUpLayout = new log4javascript.PatternLayout("%d{HH:mm:ss} %-5p - %m%n");
	    _logAppender.setLayout(_popUpLayout);
	    _log.addAppender(_logAppender);
	    _logAppender.setThreshold(APPCELERATOR_DEBUG ? log4javascript.Level.DEBUG : log4javascript.Level.WARN);
	}
	Logger.infoEnabled = _logEnabled && _logAppender;
	Logger.warnEnabled = _logEnabled && _logAppender;
	Logger.errorEnabled = _logEnabled && _logAppender;
	Logger.fatalEnabled = _logEnabled && _logAppender;
	Logger.traceEnabled = _logEnabled && APPCELERATOR_DEBUG && _logAppender;
	Logger.debugEnabled = _logEnabled && APPCELERATOR_DEBUG && _logAppender;
}
else
{
	_logAppender = true;
	_logEnabled = _logEnabled && typeof(console)!='undefined';
	_log = 
	{
		console:function(type,msg)
		{
			try
			{
				if (console && console[type]) console[type](msg);
			}
			catch(e)
			{
				
			}
		},
		debug:function(msg) { if (APPCELERATOR_DEBUG) this.console('debug',msg);  },
		info:function(msg)  { this.console('info',msg);   },
		error:function(msg) { this.console('error',msg);  },
		warn:function(msg)  { this.console('warn',msg);   },
		trace:function(msg) { if (APPCELERATOR_DEBUG) this.console('debug',msg);  },
		fatal:function(msg) { this.console('error',msg);  }
	};

	Logger.infoEnabled = _logEnabled && console.info;
	Logger.warnEnabled = _logEnabled && console.warn;
	Logger.errorEnabled = _logEnabled && console.error;
	Logger.fatalEnabled = _logEnabled && console.error;
	Logger.traceEnabled = _logEnabled && APPCELERATOR_DEBUG && console.debug;
	Logger.debugEnabled = _logEnabled && APPCELERATOR_DEBUG && console.debug;
}


Logger.info = function(msg)
{
    if (Logger.infoEnabled) _log.info(msg);
};
Logger.warn = function(msg)
{
    if (Logger.warnEnabled) _log.warn(msg);
};
Logger.debug = function(msg)
{
    if (Logger.debugEnabled) _log.debug(msg);
};
Logger.error = function(msg)
{
    if (Logger.errorEnabled) _log.error(msg);
};
Logger.trace = function(msg)
{
    if (Logger.traceEnabled) _log.trace(msg);
}
Logger.fatal = function(msg)
{
    if (Logger.fatalEnabled) _log.fatal(msg);
}


/**
 * define a convenience shortcut for debugging messages
 */
function $D()
{
    if (Logger.debugEnabled)
    {
        var args = $A(arguments);
        var msg = (args.length > 1) ? args.join(" ") : args[0];
        Logger.debug(msg);
    }
}

function $E()
{
    if (Logger.errorEnabled)
    {
        var args = $A(arguments);
        var msg = (args.length > 1) ? args.join(" ") : args[0];
        Logger.error(msg);
    }
}
