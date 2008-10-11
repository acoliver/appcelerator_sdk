var currentAddFn = $.fn.add;

$.fn.add = function(prop,value)
{
	if (arguments.length == 2 && typeof(prop)=='string')
	{
		$.each(this,function()
		{
			switch(prop)
			{
				case 'class':
				case 'className':
				{
					$(this).addClass(prop,value);
					break;
				}
				default:
				{
					$(this).attr(prop,value);
				}
			}
		});
		return this;
	}
	else
	{
		return currentAddFn.apply(this,arguments);
	}
};

$.fn.remove = function(prop)
{
	$.each(this,function()
	{
		switch(prop)
		{
			case 'class':
			case 'className':
			{
				$(this).removeClass(prop);
				break;
			}
			default:
			{
				$(this).removeAttr(prop);
			}
		}
	});
	return this;
};
