Appcelerator.UI.ContainerManager = {};
Appcelerator.UI.ContainerManager.themes = {};

Appcelerator.Core.loadTheme = function(pkg,container,theme)
{
	var path = Appcelerator.UI.ContainerManager.themes[theme];
	if (!path)
	{
		path = Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/' + pkg + 's/' + container + '/themes/' +theme+ '/'+theme+  '.css';
		Logger.info(path);
		Appcelerator.Core.remoteLoadCSS(path,function()
		{
			Appcelerator.UI.ContainerManager.themes[theme]=path;
		});
	}
};

Appcelerator.UI.registerUIManager('type', function(type,element,options)
{
	Appcelerator.UI.loadUIComponent('type',type,element,options);
});


