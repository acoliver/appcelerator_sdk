Appcelerator.UI.registerUIComponent('type','input',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [];
	},
	
	build: function(element,options)
	{
		var theme = options['theme'];
		Element.addClassName(element,"input_" + theme);
		Appcelerator.Core.loadTheme('type','input',theme);	
	}
});
