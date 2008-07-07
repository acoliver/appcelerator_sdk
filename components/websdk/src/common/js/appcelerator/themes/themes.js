Appcelerator.UI.registerUIManager('theme', function(theme,element,options)
{
	var type = element.nodeName.toLowerCase();
	options['theme']=theme;
	Appcelerator.UI.loadUIComponent('type',type,element,options);
});