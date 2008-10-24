var currentAddFn = $.fn.add;

$.fn.add = function(prop,value)
{
	if (arguments.length == 2 && typeof(prop)=='string')
	{
		switch(prop)
		{
			case 'class':
			case 'className':
			{
				this.addClass(value);
				break;
			}
			default:
			{
				this.attr(prop,value);
			}
		}
		return this;
	}
	else
	{
		return currentAddFn.apply(this,arguments);
	}
};

var currentRemoveFn = $.fn.remove;

$.fn.remove = function(prop,value)
{
	if (!prop)
	{
		return currentRemoveFn.apply(this,arguments);
	}
	
	$.each(this,function()
	{
		switch(prop)
		{
			case 'class':
			case 'className':
			{
				$(this).removeClass(value);
				break;
			}
			default:
			{
				if ($(prop).length == 0)
				{
					$(this).removeAttr(prop);			
				}
				else
				{
					currentRemoveFn.apply(this, arguments);
				}
			}
		}
	});
	return this;
};
