App.regAction(evtRegex('value'),function(params,name,data)
{
	var target = getTarget(params,this);
	var value = $.getNestedProperty(params,data,data);
	
	if (target.is(':input'))
	{
		target.val(value);
	}
	else
	{
		target.html(value);
	}
},true);

