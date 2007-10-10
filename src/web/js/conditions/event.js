Appcelerator.Compiler.Events = 
[
	'click',
	'focus',
	'blur',
	'dblclick',
	'mousedown',
	'resize',
	'mouseout',
	'mouseover',
	'mousemove',
	'change',
	'scroll',
	'keyup',
	'keypress',
	'keydown',
	'contextmenu',
	'mousewheel',
	'input',
	'paste'
];

Event.DOMEvents = Event.DOMEvents.concat(['contextmenu','input','paste']);

Appcelerator.Compiler.actionId = 0;

Appcelerator.Compiler.isEventSelector = function (token)
{
	if (token.charAt(token.length-1)=='!')
	{
		token = token.substring(0,token.length-1);
	}
	for (var c=0,len=Appcelerator.Compiler.Events.length;c<len;c++)
	{
		if (token==Appcelerator.Compiler.Events[c])
		{
			return true;
		}
		if (token.indexOf(Appcelerator.Compiler.Events[c]) != -1)
		{
			// make sure it's not another action
			return token.indexOf(':')==-1 && token.indexOf('[')==-1;
		}
	}
	return false;
};

Appcelerator.Compiler.registerCustomCondition(function(element,condition,action,elseAction,delay,ifCond)
{
	if (!Appcelerator.Compiler.isEventSelector(condition))
	{
		return null;
	}
	if (elseAction)
	{
		throw "syntax error: 'else' action not supported on event conditions for: "+condition;
	}
	var id = element.id;
	var stopEvent = false;
	if (condition.charAt(condition.length-1)=='!')
	{
		stopEvent = true;
		condition = condition.substring(0,condition.length-1);
	}
	var i = condition.indexOf('.');
	var event = condition, target = element.id, children = false;
	if (i > 0)
	{
		var tid = condition.substring(0,i);
		switch (tid)
		{
			case 'this':
			{
				target = element.id;
				break;
			}
			case 'parent':
			{
				target = element.parentNode.id;
				break;
			}
			case 'down':
			case 'after':
			case 'next':
			case 'sibling':
			case 'next-sibling':
			{
				target = element.nextSibling.id;
				break;
			}
			case 'before':
			case 'up':
			case 'prev-sibling':
			case 'previous-sibling':
			{
				target = element.previousSibling.id;
				break;
			}
			case 'child':
			case 'children':
			{
				children = true;
				break;
			}
			case 'window':
			{
				target = 'window';
				break;
			}
			case 'body':
			{
				target = document.body.id;
				break;
			}
			default:
			{
				target = tid;
			}
		}
		event = condition.substring(i+1);
	}


	var code='var ifCond = '+ifCond+';';
	code+='var action = '+String.stringValue(action)+';';
	
	//
	// be smart condition. if we attach change event to select - then include in the result
	// the value and text properties of the option selected
	// 
	if (Appcelerator.Compiler.getTagname(element) == 'select' && event == 'change' && (children || target==element.id))
	{
		code+='var element = $("'+target+'");';
		code+='var f = function(e)';
		code+='{';
		code+='var child = element.options[element.selectedIndex||0];';
		code+='var me = child;';
		code+='if (Element.isDisabled(me) || Element.isDisabled(me.parentNode)) return;';
		code+='var actionFuncString = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond,{value:child.value,text:child.text});'
		code+='eval("var actionFunc = function(scope, args, data){ " + actionFuncString + "};");';
		code+='actionFunc.call({data:{}});';
		code+='if ('+stopEvent+')';
		code+='{';
		code+='Event.stop(e);';
		code+='return false;';
		code+='}';
		code+='};';
		code+='Appcelerator.Compiler.addEventListener(element,"'+event+'",f,'+delay+');';		
	}
	else
	{
		if (children)
		{
			for (var c=0;c<element.childNodes.length;c++)
			{
				var child = element.childNodes[c];
				if (child.nodeType == 1)
				{
					code+='var actionFunc= function(scope, args, data){' + Appcelerator.Compiler.makeConditionalAction(Appcelerator.Compiler.getAndEnsureId(child),action,ifCond)+'};';
					code+='var element = $("'+child.id+'");';
					code+='var cf = function(event)';
					code+='{';
					code+='var me = $(this.scope.id);';
					code+='if (Element.isDisabled(me) || Element.isDisabled(me.parentNode)) return;';
					code+='var __method = this.method, args = $A(arguments).concat([event || window.event]);';
					code+='return __method.apply(this, this.scope, args);';
					code+='};';
					code+='cf.scope = {id:"'+child.id+'",data:{}};';
					code+='cf.method = actionFunc';
					code+='var f = cf;';
					code+='if ('+stopEvent+')';
					code+='{';
					code+='f = function(e)';
					code+='{';
					code+='cf(e);';
					code+='Event.stop(e);';
					code+='return false;';
					code+='};';
					code+='};';
					code+='Appcelerator.Compiler.addEventListener(element,"'+event+'",f,'+delay+');';
				}
			}
		}
		else
		{
			code+='var target = '+(target=='window' ? 'window' : '$("'+target+'")') + ';';
			code+='var actionFunc=function(scope, args, data){'+Appcelerator.Compiler.makeConditionalAction(target,action,ifCond)+'};';
			code+='var scope = {id:target.id,data:{}};';
			code+='var cf = function(event)';
			code+='{';
			code+='var me = $("'+target+'");';
			code+='if (Element.isDisabled(me) || Element.isDisabled(me.parentNode)) return;';
			code+='var __method = actionFunc, args = $A(arguments).concat([event || window.event]);';
			code+='return __method.call(this, scope, args);';
			code+='};';
			code+='var f = cf;';
			code+='if ('+stopEvent+')';
			code+='{';
			code+='f = function(e)';
			code+='{';
			code+='cf(e);';
			code+='Event.stop(e);';
			code+='return false;';
			code+='};';
			code+='};';
			code+='Appcelerator.Compiler.addEventListener(target,"'+event+'",f,'+delay+');';
		}
	}
	return code;
});