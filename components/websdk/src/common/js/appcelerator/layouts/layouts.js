Appcelerator.UI.LayoutManager = {};
Appcelerator.UI.LayoutManager._formatTable = function(options)
{
	return '<table width="'+options['width']+'" cellspacing="'+(options['spacing'] || '') +'" cellpadding="'+ (options['padding'] || '0') + '">';
};

Appcelerator.UI.registerUIManager('layout', function(type,element,options,callback)
{
	Appcelerator.UI.loadUIComponent('layout',type,element,options,false,callback);
});

