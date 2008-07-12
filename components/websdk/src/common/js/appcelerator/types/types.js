Appcelerator.UI.ContainerManager = {};

Appcelerator.UI.registerUIManager('type',function(type,element,options,callback)
{
	Element.addClassName(element,type);
	Appcelerator.UI.loadUIComponent('type',type,element,options,false,callback);
});


