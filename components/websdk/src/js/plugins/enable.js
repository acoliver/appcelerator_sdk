App.regAction(evtRegex('enable'),function(params)
{
	var target = getTarget(params,this);
	target.removeAttr('disabled');
	return this;
});
