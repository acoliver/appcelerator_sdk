

//
// this is a custom condition for handling executing actions based on a message condition
//
Appcelerator.Compiler.registerCustomCondition(
{
	conditionPrefixes: ['local:', 'remote:', 'l:', 'r:'],
	freeformSuffix: true,
	description: "Respond to a local or remote message"
},
function(element,condition,action,elseAction,delay,ifCond)
{
	if (condition.startsWith('local:') ||
	       condition.startsWith('l:') || 
	       condition.startsWith('remote:') ||
	       condition.startsWith('r:'))
	{
		var id = element.id;
		var actionParams = Appcelerator.Compiler.parameterRE.exec(condition);
		var type = (actionParams ? actionParams[1] : condition);
		var params = actionParams ? actionParams[2] : null;
		var actionFunc = Appcelerator.Compiler.makeConditionalAction(id,action,ifCond);
		var elseActionFunc = (elseAction ? Appcelerator.Compiler.makeConditionalAction(id,elseAction,null) : null);
		return Appcelerator.Compiler.MessageAction.makeMBListener(element,type,actionFunc,params,delay,elseActionFunc);
	}
	return null;
});

Appcelerator.Compiler.MessageAction = {};

Appcelerator.Compiler.MessageAction.onMessage = function(type,data,datatype,direction,scope,actionParamsStr,action,delay,elseaction)
{
	var ok = Appcelerator.Compiler.parseConditionCondition(actionParamsStr, data);

	var obj = {type:type,datatype:datatype,direction:direction,data:data,scope:scope};
	if (ok)
	{
		Appcelerator.Compiler.executeAfter(action,delay,obj);
	}
	else if (elseaction)
	{
		Appcelerator.Compiler.executeAfter(elseaction,delay,obj);
	}
};

Appcelerator.Compiler.MessageAction.makeMBListener = function(element,type,action,params,delay,elseaction)
{
	var actionParams = params ? Appcelerator.Compiler.getParameters(params,false) : null;
	var i = actionParams ? type.indexOf('[') : 0;
	if (i>0)
	{
		type = type.substring(0,i);
	}
	
	var paramsStr = (actionParams) ? Object.toJSON(actionParams) : null;
	$MQL(type,function(type,data,datatype,direction,scope)
	{
		Appcelerator.Compiler.MessageAction.onMessage(type,data,datatype,direction,scope,paramsStr,action,delay,elseaction);
	},element.scope,element);
	
	return true;
};
