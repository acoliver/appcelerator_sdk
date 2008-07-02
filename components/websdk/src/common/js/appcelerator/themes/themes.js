Appcelerator.UI.registerUIManager('theme', function(theme,element,options)
{
	var type = element.nodeName.toLowerCase();
	options['theme']=theme;
	Logger.info('here with '+theme+' and '+type);
	Appcelerator.UI.loadUIComponent('type',type,element,options);
});