Appcelerator.UI.ContainerManager = {};

Appcelerator.UI.registerUIManager('type', function(type,element,options)
{
	Appcelerator.UI.loadUIComponent('type',type,element,options);
});


