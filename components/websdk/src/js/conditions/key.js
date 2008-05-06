Appcelerator.Compiler.registerCustomCondition(
{
	conditionNames: ['keypress', 'keyup', 'keydown'],
	description: "Respond to key events on the element"
},
function(element,condition,action,elseAction,delay,ifCond)
{
    if (condition.indexOf('keypress')==-1 && condition.indexOf('keyup')==-1 && condition.indexOf('keydown')==-1)
    {
        return false;
    }
    
    if (elseAction)
	{
		throw "syntax error: 'else' action not supported on event conditions for: "+condition;
	}
	
    var token = condition;
	var stopEvent = false;

	if (condition.charAt(token.length-1)=='!')
	{
		condition = condition.substring(0,condition.length-1);
		stopEvent = true;
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
	
	var i = condition.indexOf('[');
	var attribute = null;
	if (i > 0)
	{
	    attribute = condition.substring(i+1,condition.indexOf(']'));
	    event = event.substring(0,i);
	}

	if (event == 'keypress' || event == 'keydown' || event == 'keyup')
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
        var cf = function(e)
        {
            var me = $(scope.id);
            if (Element.isDisabled(me) || Element.isDisabled(me.parentNode)) return;
            var e = e || window.event;
            var data = {key: e.keyCode || e.which, event: e};

            if (attribute)
            {
                switch (attribute)
                {
                    case 'enter':
                    {
                        if (data.key != Event.KEY_RETURN) return;
                        break;
                    }
                    case 'esc':
                    {
                        if (data.key != Event.KEY_ESC) return;
                        break;
                    }
                    case 'left':
                    {
                        if (data.key != Event.KEY_LEFT) return;
                        break;
                    }
                    case 'right':
                    {
                        if (data.key != Event.KEY_RIGHT) return;
                        break;
                    }
                    case 'up':
                    {
                        if (data.key != Event.KEY_UP) return;
                        break;
                    }
                    case 'down':
                    {
                        if (data.key != Event.KEY_DOWN) return;
                        break;
                    }
                    case 'tab':
                    {
                        if (data.key != Event.KEY_TAB) return;
                        break;
                    }
                    case 'delete':
                    {
                        if (data.key != Event.KEY_DELETE) return;
                        break;
                    }
                    case 'backspace':
                    {
                        if (data.key != Event.KEY_BACKSPACE) return;
                        break;
                    }
                    default:
                    {
                        if (data.key != attribute) return;
                        break;
                    }
                }
            }
            
			Appcelerator.Compiler.executeAfter(actionFunc,0,data);
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
        
        return true;
	}
	return false;
});