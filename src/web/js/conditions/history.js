//
// this is a custom condition for handling executing actions based on a message condition
//
Appcelerator.Compiler.registerCustomCondition(function(element,condition,action,elseAction,delay,ifCond)
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
		
		// support a null (no history) history
		token = token.length == 0 || token=='_none_' || token==='null' ? 'null' : "'" + token + "'";
		
		
		var code = 'Appcelerator.History.onChange(function(newLocation,data,scope)';
		code+='{';
		code+='  if (newLocation'+operator+token+'){';
		code+=actionFunc;
		if (elseActionFunc)
		{
			code+='  }else{';
			code+=elseActionFunc;
		}
		code+='  }';
		code+='});';

		return code;
	}
	return null;
});



