Appcelerator.UI.registerUIManager('behavior', function(type,element,options,callback)
{
	Appcelerator.UI.loadUIComponent('behavior',type,element,options,false,callback);
});