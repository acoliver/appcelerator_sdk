$.fn.value = function(object,property,defValue)
{
	var value = $.getNestedProperty(object,property,defValue||property);
	
	if (this.is(':input'))
	{
		this.val(value);
	}
	else
	{
		this.html(value);
	}
	
	return this;
};

