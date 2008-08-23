var APPCELERATOR_DEBUG_LEVEL = Appcelerator.Parameters.get('debug');
var APPCELERATOR_DEBUG = window.location.href.indexOf('debug=1') > 0 || APPCELERATOR_DEBUG_LEVEL=='1';
var log4javascript_threshold = Appcelerator.Parameters.get('log4javascript');

var Logger = Class.create();
$$l = Logger;
var _logAppender = null;
var _logEnabled = true;
Logger.toLevel = function(value, logger)
{
	if (!value)
		return log4javascript.Level.INFO;
	value = value.toUpperCase();
	if (value==log4javascript.Level.INFO.toString())
		return log4javascript.Level.INFO;
	else if (value==log4javascript.Level.WARN.toString())
		return log4javascript.Level.WARN;
	else if (value==log4javascript.Level.ERROR.toString())
		return log4javascript.Level.ERROR;
	else if (value==log4javascript.Level.FATAL.toString())
		return log4javascript.Level.FATAL;
	else if (value==log4javascript.Level.TRACE.toString())
		return log4javascript.Level.TRACE;
	else if (value==log4javascript.Level.DEBUG.toString())
		return log4javascript.Level.DEBUG;

	return logger.getLevel();
}

if (log4javascript_threshold && log4javascript_threshold!='')
{
	_log = log4javascript.getDefaultLogger();
	var Level = Logger.toLevel(log4javascript_threshold, _log);
	Logger.infoEnabled = log4javascript.Level.INFO.isGreaterOrEqual(Level);
	Logger.warnEnabled = log4javascript.Level.WARN.isGreaterOrEqual(Level);
	Logger.errorEnabled = log4javascript.Level.ERROR.isGreaterOrEqual(Level);
	Logger.fatalEnabled = log4javascript.Level.FATAL.isGreaterOrEqual(Level);
	Logger.traceEnabled = log4javascript.Level.TRACE.isGreaterOrEqual(Level);
	Logger.debugEnabled = log4javascript.Level.DEBUG.isGreaterOrEqual(Level);
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
        Logger.debug(Logger.buildMessage(arguments));
    }
}

function $E()
{
    if (Logger.errorEnabled)
    {
        Logger.error(Logger.buildMessage(arguments));
    }
}

// prettier debug output
Logger.buildMessage = function(args)
{
    args = $A(args)
    for(var i = 0; i<args.length; i++)
    {
        var arg = args[i];
        if(arg)
        {
            if(args[i].constructor == Object)
            {   // for simple objects
                args[i] = Object.toJSON(args[i]);
            }
            else
            {   // for dom elements, builtin types, etc
                args[i] = args[i].toString();
            }
        }
    }
    return args.join('');
}

if(typeof err == 'undefined') {
    var err = {
        println: function(msg) {
            $E(msg);
        }
    };
}
if(typeof out == 'undefined') {
    var out = {
        println: function(msg) {
            $D(msg);
        }
    };
}

