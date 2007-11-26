Appcelerator.Compiler.registerCustomCondition(function(element,condition,action,elseAction,delay,ifCond)
{
	if (condition == 'resize')
	{
		if (!element.getAttribute('resizable'))
		{
			throw "resize condition only applies to elements that have resizable attribute";
		}
		
		if (!element.resizeListeners)
		{
			element.resizeListeners = [];
		}
		
		var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond);
		element.resizeListeners.push(
		{
			onResize: function(e)
			{
				Appcelerator.Compiler.executeAfter(actionFunc,delay,{id:element.id});
			}
		});
		return true;		
	}
	
	return false;
});