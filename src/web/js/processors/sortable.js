
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
			Sortable.create(element.id,options);

			Appcelerator.Compiler.addTrash(element,function()
			{
				Sortable.destroy(element);
			});
		}
	}
});