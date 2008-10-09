App.regAction(evtRegex('value'),function(params,name,data)
{
	$.info('in value action')
	var target = getTarget(params,this);
	var value = $.getNestedProperty(params,data,data);
	$.info('value = ' + value)
	if (target.is(':input'))
	{
		target.val(value);
	}
	else
	{
		target.html(value);
	}
},true);

