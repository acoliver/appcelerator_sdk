/**
 * Appcelerator bootstrap loader
 */

/** THESE CHECKS ARE NEEDED IN CASE THE NON-BUNDLED VERSION OF PROTOTYPE/SCRIPTACULOUS IS USED **/
 
if (typeof Prototype=='undefined')
{
    var msg = 'Required javascript library "Prototype" not found';
    alert(msg);
    throw msg;
}

if (typeof Effect=='undefined')
{
    var msg = 'Required javascript library "Scriptaculous" not found';
    alert(msg);
    throw msg;
}
        

if (Object.isUndefined(window['$sl']))
{
	/**
	 * create a non-conflicting alias to $$
	 */
	window.$sl = function()
	{
	    return Selector.findChildElements(document, $A(arguments));
	}
}
if (Object.isUndefined(window['$el']))
{
	/**
	 * create a non-conflicting alias to $
	 */
	window.$el = eval('window["$"]');
}

var Appcelerator = {};
Appcelerator.Util={};
Appcelerator.Browser={};
Appcelerator.Compiler={};
Appcelerator.Config={};
Appcelerator.Core={};
Appcelerator.Localization={};
Appcelerator.Validator={};
Appcelerator.Decorator={};
Appcelerator.Module={};
Appcelerator.Widget={};
Appcelerator.Shortcuts={}; // please do not touch this

Appcelerator.started = new Date;
Appcelerator.loadTime = -1;
Appcelerator.compileTime = -1;

Appcelerator.Version = 
{
	major: parseInt('${version.major}'),
	minor: parseInt('${version.minor}'),
	revision: parseInt('${version.rev}'),
	toString:function()
	{
		return this.major + "." + this.minor + '.' + this.revision;
	}
};

Appcelerator.LicenseType = 'Apache License Version 2.0 - see http://license.appcelerator.org';
Appcelerator.Copyright = 'Copyright (c) 2006-2008 by Appcelerator, Inc. All Rights Reserved.';
Appcelerator.LicenseMessage = 'Appcelerator is licensed under ' + Appcelerator.LicenseType;
Appcelerator.Parameters = $H({});



