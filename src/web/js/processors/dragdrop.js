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
			return 'new Draggable("'+element.id+'",'+Object.toJSON(options)+');';
		}
	}
});

//
// register our drag-n-drop Droppable attribute listener
//
Appcelerator.Compiler.registerAttributeProcessor('div','droppable',
{
	handle: function(element,attribute,value)
	{
		// activate the element
		var code = 'var value = '+String.stringValue(value)+';';
		
		code += 'if (value && value!="false")';
		code += '{';
		code += 'var options = value == "true" ? {} : value.evalJSON();';
			
		code += 'options.onHover = function(e)';
		code += '{';
		code += 'var listeners = $("'+element.id+'").hoverListeners;';
		code += 'if (listeners && listeners.length > 0)';
		code += '{';
		code += 'for (var c=0;c<listeners.length;c++)';
		code += '{';
		code += 'var cb = listeners[c];';
		code += 'cb.onHover($("'+element.id+'"));';
		code += '}';
		code += '}';
		code += '};';
		
		code += 'options.onDrop = function(e)';
		code += '{';
		code += 'var listeners = $("'+element.id+'").dropListeners;';
		code += 'if (listeners && listeners.length > 0)';
		code += '{';
		code += 'for (var c=0;c<listeners.length;c++)';
		code += '{';
		code += 'var cb = listeners[c];';
		code += 'cb.onDrop($("'+element.id+'"));';
		code += '}';
		code += '}';
		code += '};';
		
		code += 'Droppables.add("'+element.id+'",options);';
		code += '}';
		return code;
	}
});
