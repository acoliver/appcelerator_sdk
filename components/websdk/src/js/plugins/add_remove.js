$.each(['add','remove'],function()
{
	App.regAction(evtRegex(this),function(params,name)
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
					if (name == 'add')
					{
						target.addClass(params[p]);						
					}
					else
					{
						target.removeClass(params[p]);					
					}
					break;
				}
				default:
				{
					if (name == 'add')
					{						
						target.attr(p,params[p]);
					}
					else
					{
						target.removeAttr(p);
					}
					break;
				}
			}
		}
		return this;
	});

});

