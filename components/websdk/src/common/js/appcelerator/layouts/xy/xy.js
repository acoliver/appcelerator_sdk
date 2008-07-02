Appcelerator.UI.registerUIComponent('layout','xy',
{	
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'top', optional: true, description: "top positioning",defaultValue: ''},
			    {name: 'bottom', optional: true, description: "bottom positioning",defaultValue: ''},
		        {name: 'left', optional: true, description: "left positioning",defaultValue: ''},
		        {name: 'right', optional: true, description: "right positioning",defaultValue: ''}
		];
	},
	build: function(element,options)
	{
		element.parentNode.style.position = "relative";
		element.style.position = "absolute";
		if (options['top']!=''){element.style.top = options['top'];}
		if (options['bottom']!=''){element.style.bottom = options['bottom'];}
		if (options['left']!=''){element.style.left = options['left'];}
		if (options['right']!=''){element.style.right = options['right'];}
	}
});
