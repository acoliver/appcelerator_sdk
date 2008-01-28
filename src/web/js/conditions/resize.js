Appcelerator.Compiler.registerCustomCondition(
{
	conditionNames: ['resize'],
	description:
	("Respond to resizing of an element, "+
	 "requires that the <i>resizable</i> attribute be set"
	)
},
function(element,condition,action,elseAction,delay,ifCond)
{
	if (condition == 'resize')
	{
		if (!element.getAttribute('resizable'))
		{
			throw "resize condition only applies to elements that have resizable=\"true\"";
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