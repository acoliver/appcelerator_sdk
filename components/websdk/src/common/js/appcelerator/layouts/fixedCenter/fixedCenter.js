Appcelerator.UI.registerUIComponent('layout','fixedCenter',
{	
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'width', optional: true, description: "width for fixed center portion",defaultValue: '1000px'}];
	},
	build: function(element,options)
	{
		element.style.width=options['width'];
		element.style.margin="auto";
	}
});