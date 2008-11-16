
/*- Appcelerator + jQuery - a match made in heaven */

//
// App is the private namespace that is used internally. This API is not stable and should not be used.
// AppC is the semi-stable API that can be used externally.
//
App = AppC = {};

AppC.Version = 
{
	value: '${version.major}.${version.minor}.${version.rev}',
	major: parseInt('${version.major}'),
	minor: parseInt('${version.minor}'),
	revision: parseInt('${version.rev}'),
	date: '${build.date}',
	toString:function()
	{
		return this.value;
	}
};

var started = new Date;
var compileTime;
var loadTime;

AppC.LicenseType = 'Apache License Version 2.0 - see http://license.appcelerator.org';
AppC.Copyright = 'Copyright (c) 2006-'+(1900+started.getYear())+' by Appcelerator, Inc. All Rights Reserved.';
AppC.LicenseMessage = 'Appcelerator is licensed under ' + AppC.LicenseType;


//
// these are parameters that can be set by the developer to customize appcelerator based on app needs
//
AppC.config = 
{
	track_stats:true,    /* true to turn on simple usage tracking to help us improve product */
	report_stats:true,   /* true to send a remote message with client stats to server on page load */
	browser_check:true,  /* true to check for valid grade-A browser support when document is loaded */
	auto_locale:false    /* true to attempt to auto load localization bundle based on users locale when page is loaded */
};

//
// these are parameters that can be used to customize appcelerator from a users perspective
//
AppC.params = 
{
	debug: 0                 /* set to 1 to turn on verbose logging, 2 to turn on only pub/sub logging */,
	delayCompile: false      /* generally don't touch this unless you really know why */
};

function queryString(uri,params)
{
	idx = uri.indexOf('?');
	params = params || {};
	if (idx > 0)
	{
		var qs = uri.substring(idx+1);
		$.each(qs.split('&'),function()
		{
			var e = this.split('=');
			var v = decodeURIComponent(e[1]||'');
			var k = decodeURIComponent(e[0]);
			switch(v)
			{
				case '1':
				case 'true':
				case 'yes':
				{
					v = true;
					break;
				}
				case '0':
				case 'false':
				case 'no':
				{
					v = false;
					break;
				}
			}
			params[k]=v;
		});
	}
	return params;
}


// get config parameters for app from the URI of the page
queryString(window.document.location.href,AppC.params);

var removeLastElement = function(uri) {
    var idx = uri.lastIndexOf('/');
    if (idx != 1)
    {
        uri = uri.substring(0, idx) + "/";
    }
    return uri;
}

// top is important such that if the JS file is in a different location (hosted)
// than the primary document, we use the primary document's path (cross site scripting)
var documentRoot = removeLastElement(top.window.document.location.href);

// get appcelerator.js and base paths
// and ensure these uris are absolute
var jsLocation = $('script[@src~=appcelerator]').get(0).src;
var baseLocation = $('base[@href]').attr('href');
baseLocation = baseLocation ? URI.absolutizeURI(baseLocation, documentRoot) : "";
jsLocation = jsLocation ? URI.absolutizeURI(jsLocation, documentRoot) : "";

if (jsLocation)
{
	AppC.sdkJS = URI.absolutizeURI(jsLocation,documentRoot);
    AppC.sdkRoot = removeLastElement(jsLocation); // parent directory of js
    var docHost = URI.splitUriRef(documentRoot)[1];
    var jsHost = URI.splitUriRef(jsLocation)[1];

    // we need to know where appcelerator.xml is located
    if (docHost == jsHost) // locally hosted
    {
        AppC.docRoot = URI.absolutizeURI(".", AppC.sdkRoot + "..");
    }
    else if (docHost != jsHost && baseLocation) // remote js -- use base location
    {
        AppC.docRoot = baseLocation;
    }
    else
    {
        AppC.docRoot = URI.absolutizeURI(".", documentRoot);
    }
}
else
{
    $.error("Can't find appcelerator.js or appcelerator-debug.js");
	return false;
}

// add a slash if the path is missing one
if (!AppC.sdkRoot.charAt(AppC.sdkRoot.length - 1) == '/')
{
    AppC.sdkRoot += '/'; 
}
if (!AppC.docRoot.charAt(AppC.docRoot.length - 1) == '/')
{
    AppC.docRoot += '/'; 
}

AppC.compRoot = AppC.sdkRoot + 'components/';
AppC.pluginRoot = AppC.sdkRoot + 'plugins/';

// override the configuration for appcelerator from the appcelerator JS query string
queryString(jsLocation, AppC.config);


var appid = 0;

App.ensureId=function(el)
{
	var rootEl = el.nodeType ? el : $(el).get(0);
	var id = rootEl.id;
	if (!id)
	{
		rootEl.id = rootEl.nodeName == 'BODY' ? 'app_body' : 'app_' + (appid++);
	}
	return el;
};

$.fn.compile = function()
{
	if (arguments.length == 2 && typeof(arguments[0])=='object')
	{
		var state = arguments[1];
		$.each(arguments[0],function()
		{
			$(this).compile(state);
		});
	}
	else if (arguments.length == 1 && typeof(arguments[0].count)=='number')
	{
		// compile a single element
		var state = arguments[0];
		var node = $(this).get(0);
		var el = App.ensureId(node);
		var e = $(el);
		App.incState(state);
		var myid = e.attr('id');
		var compiled = App.runProcessors(el,state);
		$.debug(' + compiled #'+myid+' ('+getTagName(node)+') => '+compiled);
		// if false, means that the attribute processor will call
		// checkState when he's done
		if (compiled)
		{
			App.checkState(state,el);
		}
	}
	return this;
};

$.fn.compileChildren = function(state,self)
{
	var node = $(this).get(0);
	App.ensureId(node);
	var set = getTargetCompileSet(node,self);
	this.compile(set,state);
	return this;
}

var state = function(el)
{
	this.count = 1;
	this.el = el;
	this.completed = [];
};

App.createState = function(el)
{
	return new state(el)
};

App.incState=function(state)
{
	if (state)
	{
		var count = ++state.count;
		return count;
	}
};

var bodyCompiled = false;

App.checkState=function(state,el)
{
	if (state)
	{
		if (el) state.completed.push($(el).get(0));
		var count = --state.count;
		if (count == 0)
		{
			$.each($.unique(state.completed),function()
			{
				if (this != document.body)
				{
					$(this).trigger('compiled');
				}
			});
			// we must always fire compiled on body and do it last
			// but we only ever fire it once for a document load
			if (!bodyCompiled)
			{
				bodyCompiled=true;
				$(document.body).trigger('compiled');
			}
		}
	}
};

function getTargetCompileSet(node,self)
{
	var expr = null, filter = null;
	
	if (node!=null)
	{
		node = typeof(node.nodeType)=='undefined' ? node.get(0) : node;
		var parent = node.nodeName == 'BODY' ? 'body' : '#'+node.id;
		expr = (self ? (parent + ',') : '')  + parent + ' ' + App.selectors.join(', ' + parent + ' ');
	}
	else
	{
		expr = App.selectors.join(',');
		filter = function()
		{
			// this filter prevents us from compiling an element has is child of
			// any parent where it has set attribute
			var exclude = App.delegateCompilers.join(',');
			return !$(this).parents(exclude).length;
		};
	}
	
	if (filter)
	{
		return $.unique($(expr).filter(filter));
	}
	
	return $.unique($(expr));
};

var beforeCompilers = [];

AppC.beforeCompile = function(f)
{
	if (!beforeCompilers)
	{
		f();
	}
	else
	{
		beforeCompilers.push(f);
	}
	return AppC;
};

AppC.compileDocument = function()
{
	var compileStarted = new Date;
	var body = $(document.body);
	
	// call any pending guys waiting for us to get 
	// started (means they're waiting for document.ready)
	if (beforeCompilers)
	{
		$.each(beforeCompilers,function()
		{
			this(body);
		});
		beforeCompilers=null;
	}
	
	body.bind('compiled',function()
	{
		body.pub('l:app.compiled',{
			event:{id:document.body.id||'body'}
		});
		$(document).trigger('compiled');
		body.css('display','block');
		compileFinished = new Date;
		loadTime = compileFinished - started;
		compileTime = compileFinished - compileStarted;
		
		if (top.window === window)
		{
			$.info(AppC.Copyright);
			$.info(AppC.LicenseMessage);
			$.info('loaded in ' + (loadTime) + ' ms, compiler took ~'+(compileTime)+' ms');
			$.info('Appcelerator is ready!');
		}
	});
	
	var s = new state(body);
	$(document).compile(getTargetCompileSet(),s);
	App.checkState(s); // state starts at 1, call to dec
};

if (!AppC.params.delayCompile) $(AppC.compileDocument);

// we do a little trickery here to hide the body while we're loading
// and then we can display it once compiled - this prevents crazy
// components to be displayed before they're finished compiling
document.write('<style>body{display:none}</style>');
