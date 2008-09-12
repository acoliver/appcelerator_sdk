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
    if (!condition.startsWith('history:') && !condition.startsWith('history['))
	{
		return false;
	}

    var token = null;

    if (condition.startsWith('history:'))
    {
        token = condition.substring(8);
    }
    
    if (condition.startsWith('history['))
    {
        token = condition.substring(8,condition.indexOf(']'));
    }

	// allow token to be empty string which is essentially wildcard
    token = token || '';

	var id = element.id;
	var actionFunc = Appcelerator.Compiler.makeConditionalAction(id,action,ifCond);
	var elseActionFunc = elseAction ? Appcelerator.Compiler.makeConditionalAction(id,elseAction,null) : null;
	var operator = '==';
	var regex = null;

	if (token.charAt(0)=='!')
	{
		token = token.substring(1);
		operator = '!=';
	}
	else if (token == '*')
	{
	    operator = '*';
	}
	else if (token.charAt(0)=='~')
	{
		operator = 'regex';
		token = token.substring(1);
	}
	else if (token.indexOf('*') > -1)
	{
		operator = 'regex';
		token = token.gsub(/\*/,'(.*)?');
	}
	
	if (operator == 'regex')
	{
		regex = new RegExp(token);
	}
	
	// support a null (no history) history
	token = token.length == 0 || token=='_none_' || token==='null' ? null : token;
	
	Appcelerator.History.onChange(function(newLocation,data,scope)
	{
		var fire = false;
		switch (operator)
		{
			case 'regex':
			{
				fire = regex.test(newLocation);
				break;
			}
			case '==':
			{
				fire = (newLocation == token);
				break;
			}
			case '!=':
			{
				fire = (newLocation != token);
				break;
			}
			case '*':
			{
				fire = !Object.isUndefined(newLocation);
				break;
			}
		}
		if (fire)
		{
			Appcelerator.Compiler.executeAfter(actionFunc,delay,{data:data});
		}
		else if (elseActionFunc)
		{
			Appcelerator.Compiler.executeAfter(elseActionFunc,delay,{data:data});
		}
	});
	return true;
});



