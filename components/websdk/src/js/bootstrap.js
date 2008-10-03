
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

AppC.LicenseType = 'Apache License Version 2.0 - see http://license.appcelerator.org';
AppC.Copyright = 'Copyright (c) 2006-2008 by Appcelerator, Inc. All Rights Reserved.';
AppC.LicenseMessage = 'Appcelerator is licensed under ' + AppC.LicenseType;

var started = new Date;

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

AppC.docRoot = docRoot;

var absRe = /file:|http(s)?:/

var jsLocation = $('script[@src~=appcelerator]').attr('src');

if (!absRe.test(jsLocation))
{
	jsLocation = AppC.docRoot + (jsLocation.charAt(0)=='/' ? jsLocation.substring(1) : jsLocation);
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
};

App.incState=function(state)
{
	if (state) ++state.count;
};

App.checkState=function(state,el)
{
	if (state)
	{
		$(el).trigger('compiled');
		if (--state.count == 0)
		{
			$.debug('compiled complete for '+$(state.el).get(0));
			state.el.trigger('compiled');
		}
	}
};


$(document).ready(function()
{
	var body = $('body');
	body.bind('compiled',function()
	{
		body.pub('l:app.compiled');
	});
	var s = new state(body);
	body.compile(s);
	$.info('loaded in ' + (new Date - started) + ' ms');
});


