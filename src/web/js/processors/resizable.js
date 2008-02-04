//
// register our resizable attribute listener
//
Appcelerator.Compiler.registerAttributeProcessor(['div','img', 'table'],'resizable',
{
	handle: function(element,attribute,value)
	{
		if (value && value!='false')
		{
			var options = value == "true" ? {} : value.evalJSON();
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
			
			Appcelerator.Compiler.addTrash(element, function()
			{
				element.resizable.destroy();
			});
		}
	},
	metadata:
	{
		description: (
		""
		)
	}
});
