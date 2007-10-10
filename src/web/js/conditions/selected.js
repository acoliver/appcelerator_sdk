
Appcelerator.Compiler.Selected = {};
Appcelerator.Compiler.Selected.makeSelectedListener = function(element,condition,action,elseAction,delay,ifCond)
{
	var code = '';
	code += 'Appcelerator.Compiler.attachFunction($("'+element.id+'"),"selected",function(selected,count,unselect)';
	code += '{';
	code += 'if (selected)';
	code += '{';
	ifCond = (ifCond) ? '"'+ifCond+'"' : null;
	code += 'var actionFunc = Appcelerator.Compiler.makeConditionalAction("'+element.id+'","'+action+'",'+ifCond+',{count:count,unselect:unselect}).toFunction(true);';
	code += 'Appcelerator.Compiler.executeAfter(actionFunc,'+delay+',{count:count,id:"'+element.id+'",unselect:unselect});';
	code += '}';
	if (elseAction)
	{
		elseAction = '"'+elseAction+'"';
		code += 'else';
		code += '{';
		code += 'var elseActionFunc = Appcelerator.Compiler.makeConditionalAction("'+element.id+'",'+elseAction+',null,{count:count,unselect:unselect}).toFunction(true);';
		code += 'Appcelerator.Compiler.executeAfter(elseActionFunc,'+delay+',{count:count,id:"'+element.id+'",unselect:unselect});';
		code += '};';
	}
	code += '});';
	
	return code;
};

Appcelerator.Compiler.registerCustomCondition(function(element,condition,action,elseAction,delay,ifCond)
{
	var code = '';
	
	switch (condition)
	{
		case 'selected':
		{
			code += 'Element.addClassName($("'+element.id+'"),"app_selectable");';
			code += Appcelerator.Compiler.Selected.makeSelectedListener(element,condition,action,elseAction,delay,ifCond);
			break;
		}
		case 'parent.selected':
		{
			code += 'Element.addClassName($("'+element.id+'"),"app_selectable");';
			code += Appcelerator.Compiler.Selected.makeSelectedListener(element.parentNode,condition,action,elseAction,delay,ifCond);
			break;
		}
		case 'children.selected':
		case 'child.selected':
		{
			code += 'Element.addClassName($("'+element.id+'"),"app_selectgroup");';
			for (var c=0;c<element.childNodes.length;c++)
			{
				var child = element.childNodes[c];
				if (child.nodeType == 1)
				{
					code += 'Element.addClassName($("'+child.id+'"),"app_selectable");';
					code += Appcelerator.Compiler.Selected.makeSelectedListener(child,condition,action,elseAction,delay,ifCond);
				}
			}
			break;
		}
		default:
		{
			return null;
		}
	}
	return code;
});