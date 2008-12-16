
//
// register our drag-n-drop Sortable attribute listener
//
Appcelerator.Compiler.registerAttributeProcessor(['div','ul','ol'],'sortable',
{
	handle: function(element,attribute,value)
	{
		// activate the element
		if (value && value!='false')
		{
			var options = value == 'true' ? {} : value.evalJSON();
			
			// let's be smart here and go ahead and set the child tag type
			// if not already set
			if (!options.tag)
			{
				Element.cleanWhitespace(element);
				var child = element.down();
				if (child)
				{
					options.tag = Appcelerator.Compiler.getTagname(child);
				}
			}
			
			options.onUpdate = function(e)
			{
				var listeners = element.updateListeners;
				if (listeners && listeners.length > 0)
				{
					for (var c=0;c<listeners.length;c++)
					{
						var cb = listeners[c];
						cb.onUpdate(e);
					}
				}
			};
			
			options.onChange = function(e)
			{
				var listeners = element.changeListeners;
				if (listeners && listeners.length > 0)
				{
					for (var c=0;c<listeners.length;c++)
					{
						var cb = listeners[c];
						cb.onChange(e);
					}
				}
			};
			
			Sortable.create(element.id,options);

			Appcelerator.Compiler.addTrash(element,function()
			{
				Sortable.destroy(element);
			});
		}
	}
});