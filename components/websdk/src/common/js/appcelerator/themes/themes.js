Appcelerator.UI.registerUIManager('theme', function(theme,element,options)
{
	// is this a default setting
	if (theme == 'defaults')
	{
		for (var key in options)
		{
			Appcelerator.UI.UIManager.setDefaultThemes(key,options[key])
		}
	}
	else
	{
		var type = element.nodeName.toLowerCase();
		options['theme']=theme;
		Appcelerator.UI.loadUIComponent('type',type,element,options);		
	}
});

