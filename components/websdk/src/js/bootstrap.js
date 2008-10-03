
/*- Appcelerator + jQuery - a match made in heaven */

App = AppC = jQuery.prototype;

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

AppC.LicenseType = 'Apache License Version 2.0 - see http://license.appcelerator.org';
AppC.Copyright = 'Copyright (c) 2006-'+(1900+started.getYear())+' by Appcelerator, Inc. All Rights Reserved.';
AppC.LicenseMessage = 'Appcelerator is licensed under ' + AppC.LicenseType;


var docRoot;
var idx = top.window.document.location.href.lastIndexOf('/');
if (idx == top.window.document.location.href.length - 1)
{
	docRoot = top.window.document.location.href;
}
else
{
    docRoot  = top.window.document.location.href.substr(0, idx);
    if (docRoot.substring(docRoot.length - 1) != '/')
    {
        docRoot  = docRoot + '/';
    }
}

AppC.params = {};
idx = top.window.document.location.href.indexOf('?');
if (idx > 0)
{
	var qs = top.window.document.location.href.substring(idx+1);
	$.each(qs.split('&'),function()
	{
		var e = this.split('=');
		AppC.params[decodeURIComponent(e[0])]=decodeURIComponent(e[1]||'');
	});
}

AppC.docRoot = docRoot;

var absRe = /file:|http(s)?:/

var jsLocation = $('script[@src~=appcelerator]').attr('src');
var baseLocation = $('base[@href]').attr('href');

if (baseLocation)
{
	AppC.docRoot = baseLocation;
}

if (!absRe.test(jsLocation))
{
	jsLocation = AppC.docRoot + (jsLocation.charAt(0)=='/' ? jsLocation.substring(1) : jsLocation);
}

if (jsLocation)
{
	if (!baseLocation)
	{
		// see if it's a full URI
		var hostIdx = jsLocation.indexOf(':/');
		if (hostIdx > 0)
		{
			var jsHostPath = jsLocation.substring(hostIdx + 3, jsLocation.indexOf('/',hostIdx + 4));
			var docIdx = AppC.docRoot.indexOf(':/');
			if (docIdx > 0)
			{
				var docHostPath = AppC.docRoot.substring(docIdx + 3, AppC.docRoot.indexOf('/',docIdx+4));
				if (docHostPath == jsHostPath)
				{
					// if on the same host then always prefer the JS location (one directory up) as the base href
					// such that we can have multiple content directories that include the JS relatively from the top
					AppC.docRoot = URI.absolutizeURI(jsLocation.substring(0,jsLocation.lastIndexOf('/')) + '/../',AppC.docRoot);
				}
			}
		}
		else
		{
			// relative URI we need to adjust the DocumentPath
			if (jsLocation.charAt(0)=='/' || jsLocation.charAt(0)=='.')
			{
				var idx = jsLocation.lastIndexOf('/');
				if (idx!=-1)
				{
					AppC.docRoot = URI.absolutizeURI(jsLocation.substring(0,idx+1) + '../',AppC.docRoot);
				}
			}
		}
	}
}


AppC.compRoot = AppC.docRoot + 'components';
AppC.pluginRoot = AppC.compRoot + '/plugins';

var appid = 0;

function ensureId (el)
{
	var id = $(el).attr('id');
	if (!id)
	{
		id = el.nodeName == 'BODY' ? 'app_body' : 'app_' + (appid++);
		$(el).attr('id',id);
	}
	return el;
}

$.fn.compile = function(state)
{
	var node = $(this).get(0);
	var el = ensureId(node);
	var e = $(el);
	App.incState(state);
	var myid = e.attr('id');
	e.data('stopCompile',false);
	$.debug(' + compiling #'+myid+' ('+node.nodeName+')');
	App.executeActions(el,state);
	var stop = e.data('stopCompile');
	e.removeData('stopCompile');
	if (!stop)
	{
		$('#'+myid).compileChildren(state);
	}
	App.checkState(state,el);
	return this;
};

$.fn.compileChildren = function(state)
{
	var node = $(this).get(0);
	var parent = node.nodeName == 'BODY' ? 'body' : '#'+node.id;
	var selector = parent+' > '+App.selectors.join(', '+parent+' > ');
	
	$.each($.unique($(selector)),function()
	{
		$(this).compile(state);
	});
	
	return this;
}

var state = function(el)
{
	this.count = 0;
	this.el = el;
	this.completed = [];
};

App.incState=function(state)
{
	if (state)
	{
		var count = ++state.count;
		return count;
	}
};

App.checkState=function(state,el)
{
	if (state)
	{
		state.completed.push($(el).get(0));
		var count = --state.count;
		if (count == 0)
		{
			$.each($.unique(state.completed),function()
			{
				$(this).trigger('compiled');
			});
		}
	}
};

$(document).ready(function()
{
	var body = $('body');
	body.bind('compiled',function()
	{
		$.debug('compiled called '+$(this).get(0));
		body.pub('l:app.compiled');
	});

	var s = new state(body);
	body.compile(s);

	$.info('Appcelerator is ready');
	$.info(AppC.Copyright);
	$.info(AppC.LicenseMesage);
	$.info('loaded in ' + (new Date - started) + ' ms');
});


