/////////////////////////////////////////////////////////////////////////
//
// Theme Functions
//
////////////////////////////////////////////////////////////////////////

Appcelerator.UI.themes = {};

//
//  Default Themes by Control
//
Appcelerator.UI.defaultThemes = 
{
	'panel':'basic',
	'shadow':'basic',
	'button':'white_gradient',
	'input':'white_gradient',
	'textarea':'white_gradient',
	'select':'thinline',
	'tabpanel':'white',
	'accordion':'basic'
};

//
// Get a default theme for a control
//
Appcelerator.UI.getDefaultTheme = function(type)
{
	return Appcelerator.UI.defaultThemes[type];
};

//
// Set a default theme for a control
//
Appcelerator.UI.setDefaultThemes = function(type,theme)
{
	Appcelerator.UI.defaultThemes[type] = theme;
};

//
// Register a theme handler
//
Appcelerator.UI.registerTheme = function(type,container,theme,impl)
{
	var key = Appcelerator.UI.getThemeKey(type,container,theme);
	var themeImpl = Appcelerator.UI.themes[key];
	if (!themeImpl)
	{
		themeImpl = {};
		Appcelerator.UI.themes[key] = themeImpl;
	}
	themeImpl.impl = impl;
	themeImpl.loaded = true;
	// trigger on registration any pending guys
	Appcelerator.UI.loadTheme(type,container,theme,null,null);
};

//
// Contruct a theme key
//
Appcelerator.UI.getThemeKey = function(pkg,container,theme)
{
	return pkg + ':' + container + ':' + theme;
};

//
// Dynamically load a theme file
//
Appcelerator.UI.loadTheme = function(pkg,container,theme,element,options)
{
	theme = theme || Appcelerator.UI.getDefaultTheme(container);
	var key = Appcelerator.UI.getThemeKey(pkg,container,theme);
	var themeImpl = Appcelerator.UI.themes[key];
	var fetch = false;
	var path = Appcelerator.DocumentPath + '/components/' + pkg + 's/' + container + '/themes/' +theme;

	if (!themeImpl)
	{
		themeImpl = { callbacks: [], impl: null, loaded: false, path: path };
		Appcelerator.UI.themes[key] = themeImpl;
		fetch = true;
	}
	
	if (themeImpl.loaded)
	{
		if (themeImpl.callbacks && themeImpl.callbacks.length > 0 && themeImpl.impl && themeImpl.impl.build)
		{
			for (var c=0;c<themeImpl.callbacks.length;c++)
			{
				var callback = themeImpl.callbacks[c];
				themeImpl.impl.build(callback.element,callback.options);
			}
		}
		if (element!=null && options!=null && themeImpl.impl && themeImpl.impl.build)
		{
			if (themeImpl.impl.setPath)
			{
				themeImpl.impl.setPath.call(themeImpl.impl,path);
			}
			themeImpl.impl.build(element,options);
		}
		themeImpl.callbacks = null;
	}
	else
	{
		themeImpl.callbacks.push({element:element,options:options});
	}
	
	if (fetch)
	{
		var css_path =  path + '/' +theme+  '.css';
		Appcelerator.Core.remoteLoadCSS(css_path);

		var js_path = path + '/' +theme+  '.js';
		Appcelerator.Core.remoteLoadScript(js_path,null,function()
		{
			Appcelerator.UI.handleLoadError(element,pkg,theme,container,js_path);
		});
	}
};
