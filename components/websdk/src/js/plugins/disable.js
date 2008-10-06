App.regAction(evtRegex('disable'),function(params)
{
	var target = getTarget(params,this);
	target.attr('disabled',true);
	return this;
});
