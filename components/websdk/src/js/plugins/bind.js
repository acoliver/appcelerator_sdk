
var oldBind = $.fn.bind;

$.fn.bind = function()
{
	if (arguments.length > 1)
	{
		// jQuery bind
		return oldBind.apply(this,arguments);
	}
	else
	{
		alert('foo')
		var obj = arguments[0];
		$.each(this,function(idx)
		{
			var t = $(this).get(idx);
			$.each($(t).children(),function()
			{
				var child = $(this);
				var name = child.attr('name');
				var value = name ? obj[name] : obj[child.attr('id')];
				if (value)
				{
					//REVIEW: value?
					child.val(value);
				}
			});
		});
	}
	return this;
};



