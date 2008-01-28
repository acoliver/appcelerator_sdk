
Appcelerator.Compiler.Selected = {};
Appcelerator.Compiler.Selected.makeSelectedListener = function(element,condition,action,elseAction,delay,ifCond)
{
	var id = Appcelerator.Compiler.getAndEnsureId(element);
	Appcelerator.Compiler.attachFunction(element,'selected',function(selected,count,unselect)
	{
		if (selected)
		{
			var actionFunc = Appcelerator.Compiler.makeConditionalAction(id,action,ifCond,{count:count,unselect:unselect});
			Appcelerator.Compiler.executeAfter(actionFunc,delay,{count:count,id:id,unselect:unselect});
		}
		else if (elseAction)
		{
			var elseActionFunc = Appcelerator.Compiler.makeConditionalAction(id,elseAction,null,{count:count,unselect:unselect});
			Appcelerator.Compiler.executeAfter(elseActionFunc,delay,{count:count,id:id,unselect:unselect});
		}
	});
};

Appcelerator.Compiler.registerCustomCondition(
{
	conditionPrefixes: ['parent.', 'child.', 'children.'],
	conditionSuffixes: ['selected'],
	prefixOptional: true,
	description:
	("Respond to selection of this element, "+
	 "requires the <i>selectable</i> attribute be set"
	)
},
function(element,condition,action,elseAction,delay,ifCond)
{
	switch (condition)
	{
		case 'selected':
		{
			Element.addClassName(element,'app_selectable');
			Appcelerator.Compiler.Selected.makeSelectedListener(element,condition,action,elseAction,delay,ifCond);
			break;
		}
		case 'parent.selected':
		{
			Element.addClassName(element,'app_selectable');
			Appcelerator.Compiler.Selected.makeSelectedListener(element.parentNode,condition,action,elseAction,delay,ifCond);
			break;
		}
		case 'children.selected':
		case 'child.selected':
		{
			Element.addClassName(element,'app_selectgroup');
			for (var c=0;c<element.childNodes.length;c++)
			{
				var child = element.childNodes[c];
				if (child.nodeType == 1)
				{
					Element.addClassName(child,'app_selectable');
					Appcelerator.Compiler.Selected.makeSelectedListener(child,condition,action,elseAction,delay,ifCond);
				}
			}
			break;
		}
		default:
		{
			return false;
		}
	}
	return true;
});