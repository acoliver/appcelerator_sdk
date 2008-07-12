Appcelerator.UI.registerUIComponent('behavior','resizable',
{
	getAttributes: function()
	{
		return [];
	},
	build: function(element,options)
	{
		options.resize = function(e)
		{
			var listeners = element.resizeListeners;
			if (listeners && listeners.length > 0)
			{
				for (var c=0;c<listeners.length;c++)
				{
					var cb = listeners[c];
					cb.onResize(e);
				}
			}
		};
		
		element.resizable = new Resizeable(element.id, options);
		
		Appcelerator.Compiler.addTrash(container, function()
		{
			element.resizable.destroy();
		});
	}
});