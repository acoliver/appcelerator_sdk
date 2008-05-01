//
// this is a custom condition for handling executing actions based on a message condition
//
Appcelerator.Compiler.registerCustomCondition(
{
	conditionPrefixes: ['history:==', 'history:!='],
	suffixOptional: true,
	description: "Respond to back/forward navigation"
},
function(element,condition,action,elseAction,delay,ifCond)
{
	if (condition.startsWith('history:'))
	{
		var id = element.id;
		var token = condition.substring(8);
		var actionFunc = Appcelerator.Compiler.makeConditionalAction(id,action,ifCond);
		var elseActionFunc = elseAction ? Appcelerator.Compiler.makeConditionalAction(id,elseAction,null) : null;
		var operator = '==';

		if (token.charAt(0)=='!')
		{
			token = token.substring(1);
			operator = '!=';
		}
		else if (token == '*')
		{
		    operator = '*';
		}
		
		// support a null (no history) history
		token = token.length == 0 || token=='_none_' || token==='null' ? null : token;
		
		Appcelerator.History.onChange(function(newLocation,data,scope)
		{
			switch (operator)
			{
				case '==':
				{
					if (newLocation == token)
					{
						Appcelerator.Compiler.executeAfter(actionFunc,delay,{data:data});
					}
					else if (elseActionFunc)
					{
						Appcelerator.Compiler.executeAfter(elseActionFunc,delay,{data:data});
					}
					break;
				}
				case '!=':
				{
					if (newLocation != token)
					{
						Appcelerator.Compiler.executeAfter(actionFunc,delay,{data:data});
					}
					else if (elseActionFunc)
					{
						Appcelerator.Compiler.executeAfter(elseActionFunc,delay,{data:data});
					}
					break;
				}
				case '*':
				{
				    if (newLocation)
				    {
    					Appcelerator.Compiler.executeAfter(actionFunc,delay,{data:data});
				    }
					break;
				}
			}
		});
		return true;
	}
	return false;
});



