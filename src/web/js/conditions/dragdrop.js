Appcelerator.Compiler.registerCustomCondition(function(element,condition,action,elseAction,delay,ifCond)
{
	var eventName = null;
	var code = '';

	switch (condition)
	{
		case 'dragstart':
		{
			eventName = 'onStart';
			break;
		}
		case 'drag':
		{
			eventName = 'onDrag';
			break;
		}
		case 'dragend':
		{
			eventName = 'onEnd';
			break;
		}
		case 'dragover':
		{
			if (!element.getAttribute('droppable'))
			{
				throw "dragover condition only applies to elements that have droppable attribute";
			}
			
			if (!element.hoverListeners)
			{
				element.hoverListeners = [];
			}
			
			var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond);
			element.hoverListeners.push(
			{
				onHover: function(e)
				{
					Appcelerator.Compiler.executeAfter(actionFunc,delay,{id:element.id,dragged:e});
				}
			});
			return true;
		}
		case 'drop':
		{
			if (!element.getAttribute('droppable'))
			{
				throw "drop condition only applies to elements that have droppable attribute";
			}
			
			if (!element.dropListeners)
			{
				element.dropListeners = [];
			}
			
			var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond);
			element.dropListeners.push(
			{
				onDrop: function(e)
				{
					Appcelerator.Compiler.executeAfter(actionFunc,delay,{id:element.id,dropped:e});
				}
			});
			return true;
		}
	}
	
	if (eventName)
	{
		var id = element.id;
		var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond);
		var observer = {};
		observer[eventName] = function(type, draggable)
		{
			if (draggable.element.id == id)
			{
				Appcelerator.Compiler.executeAfter(actionFunc,delay,{id:id});
			}
		;}
		Draggables.addObserver(observer);
		
		Appcelerator.Compiler.addTrash(element, function()
		{
			Draggables.removeObserver(element);
		});
		return true;
	}
	
	return false;
});