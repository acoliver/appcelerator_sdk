Appcelerator.Compiler.Events = 
[
	'click',
	'focus',
	'blur',
	'dblclick',
	'mousedown',
	'mouseout',
	'mouseover',
	'mousemove',
	'change',
	'scroll',
	'contextmenu',
	'mousewheel',
	'input',
	'paste',
	'orientationchange'
];

Appcelerator.Compiler.EventTargets =
[
    'this',
	'parent',
    'down',
    'after',
    'next',
    'sibling',
    'next-sibling',
    'before',
    'up',
    'prev-sibling',
    'previous-sibling',
    'child',
    'children',
    'window',
    'body'
];

Appcelerator.Compiler.actionId = 0;

Appcelerator.Compiler.isEventSelector = function (token)
{
    if (token.indexOf(':')!=-1 || token.indexOf('[')!=-1)
    {
        return false;
    }
    
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
		
		var i = token.indexOf('.');
		realtoken = token.substring(i+1);
		if (realtoken==Appcelerator.Compiler.Events[c])
		{
			return true;
		}
	}
	return false;
};

Appcelerator.Compiler.registerCustomCondition(
{
	conditionPrefixes: Appcelerator.Compiler.EventTargets.map(function(targetName){ return targetName+'.'}),
	conditionSuffixes: Appcelerator.Compiler.Events,
	prefixOptional: true,
	description: "Respond to standard DOM event"
},
function(element,condition,action,elseAction,delay,ifCond)
{
	if (!Appcelerator.Compiler.isEventSelector(condition))
	{
		return false;
	}

	if (elseAction)
	{
		throw "syntax error: 'else' action not supported on event conditions for: "+condition;
	}

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

	// target the body with the iPhone's orientationchange event
	if (event == 'orientationchange') target = document.body.id;

	//
	// be smart condition. if we attach change event to select - then include in the result
	// the value and text properties of the option selected
	// 
	if (Appcelerator.Compiler.getTagname(element) == 'select' && event == 'change' && (children || target==element.id))
	{
		var f = function(e)
		{
			var child = element.options[element.selectedIndex||0];
			var me = child;
			if (Element.isDisabled(me) || Element.isDisabled(me.parentNode)) return;
			var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond,{value:child.value,text:child.text});
			actionFunc();
			if (stopEvent)
			{
				Event.stop(e);
				return false;
			}
		};
		Appcelerator.Compiler.addEventListener(element,event,f,delay);		
	}
    else if(event == 'change')
    {
        var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond);
        
        element._validatorObserver = new Form.Element.Observer(
            element,
            .5,  
            function(element, value)
            {
                actionFunc(element,value);
            }
        );
    }
	else
	{
		if (children)
		{
			for (var c=0;c<element.childNodes.length;c++)
			{
				(function(){
					var child = element.childNodes[c];
					if (child.nodeType == 1)
					{
						Appcelerator.Compiler.getAndEnsureId(child);
						$D('adding listener to '+child.id+' for event: '+event);
						var cf = function(event)
						{
							var me = child;
							if (Element.isDisabled(me) || Element.isDisabled(me.parentNode)) return;
							var actionFunc = Appcelerator.Compiler.makeConditionalAction(Appcelerator.Compiler.getAndEnsureId(child),action,ifCond);
						    var __method = actionFunc, args = $A(arguments);
						    return __method.apply(this, [event || window.event].concat(args));
						};
						var f = cf;
						if (stopEvent)
						{
							f = function(e)
							{
								cf(e);
								Event.stop(e);
								return false;
							};
						}
						Appcelerator.Compiler.addEventListener(child,event,f,delay);					
					}
				})();
			}
		}
		else
		{
			if (Object.isString(target))
			{
				target = target == 'window' ? window : $(target);
			}

			if (!target)
			{
				throw "syntax error: target not found for "+condition;
			}

			$D('adding listener to '+target+', name: '+target.nodeName+', id: '+target.id+' for event: '+event);
			var actionFunc = Appcelerator.Compiler.makeConditionalAction(target.id,action,ifCond);

			var scope = {id:target.id};
			var cf = function(event)
			{
				var me = $(scope.id);
				if (Element.isDisabled(me) || Element.isDisabled(me.parentNode)) return;
			    var __method = actionFunc, args = $A(arguments);
			    return __method.apply(scope, [event || window.event].concat(args));
			};
			var f = cf;
			if (stopEvent)
			{
				f = function(e)
				{
					cf(e);
					Event.stop(e);
					return false;
				};
			}

			Appcelerator.Compiler.addEventListener(target,event,f,delay);
		}
	}
	return true;
});

//handle the iPhone's originationchange event by dispatching our own custom event called orientationchange
if (Appcelerator.Browser.isIPhone)
{
	window.onorientationchange = function() 
	{
		var evt = document.createEvent("Events");
		evt.initEvent('orientationchange', true, true); //true for can bubble, true for cancelable
		document.body.dispatchEvent(evt);
	}
}