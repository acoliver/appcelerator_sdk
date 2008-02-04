//
// register our drag-n-drop Draggable attribute listener
//
Appcelerator.Compiler.registerAttributeProcessor('div','draggable',
{
	handle: function(element,attribute,value)
	{
		// activate the element
		if (value && value!='false')
		{
			var options = value == 'true' ? {} : value.evalJSON();
			var d = new Draggable(element.id,options);
			Appcelerator.Compiler.addTrash(element,function()
			{
				d.destroy();
			});
		}
	},
	metadata:
	{
		description: (
		"Make this element draggable. Dragged elements can be dropped on a droppable."
		)
	}
});

//
// register our drag-n-drop Droppable attribute listener
//
Appcelerator.Compiler.registerAttributeProcessor('div','droppable',
{
	handle: function(element,attribute,value)
	{
		if (value && value!='false')
		{
			var options = value == "true" ? {} : value.evalJSON();
			options.onHover = function(e)
			{
				var listeners = element.hoverListeners;
				if (listeners && listeners.length > 0)
				{
					for (var c=0;c<listeners.length;c++)
					{
						var cb = listeners[c];
						cb.onHover(e);
					}
				}
			};
			
			options.onDrop = function(e)
			{
				var listeners = element.dropListeners;
				if (listeners && listeners.length > 0)
				{
					for (var c=0;c<listeners.length;c++)
					{
						var cb = listeners[c];
						cb.onDrop(e);
					}
				}
			};
			
			Droppables.add(element.id,options);
			
			Appcelerator.Compiler.addTrash(element, function()
			{
				Droppables.remove(element);
			});
		}
	},
	metadata:
	{
		description: (
		"Make this element a possible drop target."
		)
	}
});
