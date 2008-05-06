Appcelerator.Compiler.registerCustomCondition(
{
	conditionNames: ['sortupdate', 'sortchange'],
	description: "Respond to sortable events on the element"
},
function(element,condition,action,elseAction,delay,ifCond)
{
	var eventName = null;
	
	switch (condition)
	{
		case 'sortupdate':
		{
			if (!element.getAttribute('sortable'))
			{
				throw "sortupdate condition only applies to elements that have sortable attribute";
			}
			
			if (!element.updateListeners)
			{
				element.updateListeners = [];
			}
			
			var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond);
			element.updateListeners.push(
			{
				onUpdate: function(e)
				{
					Appcelerator.Compiler.executeAfter(actionFunc,delay,{id:e.id});
				}
			});
			return true;
		}
		case 'sortchange':
		{
			if (!element.getAttribute('sortable'))
			{
				throw "sortchange condition only applies to elements that have sortable attribute";
			}
			
			if (!element.changeListeners)
			{
				element.changeListeners = [];
			}
			
			
			var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond);
			element.changeListeners.push(
			{
				onChange: function(e)
				{
					Appcelerator.Compiler.executeAfter(actionFunc,delay,{id:e.id});
				}
			});
			return true;
		}
	}
	
	return false;
});