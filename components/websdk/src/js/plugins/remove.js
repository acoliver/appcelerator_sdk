App.regAction(evtRegex('remove'),function(params)
{
	var target = getTarget(params,this);
	
	for (var p in params)
	{
		switch(p)
		{
			case 'id':
			case 'event':
			{
				break;
			}
			case 'class':
			case 'className':
			{
				target.removeClass(params[p]);
				break;
			}
			default:
			{
				target.removeAttr(p,params[p]);
				break;
			}
		}
	}
	return this;
});