App.regAction(evtRegex('add'),function(params)
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
				target.addClass(params[p]);
				break;
			}
			default:
			{
				target.attr(p,params[p]);
				break;
			}
		}
	}
	return this;
});

