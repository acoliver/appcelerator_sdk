App.regAction(evtRegex('binded'),function(params)
{
	var target = getTarget(params,this);
	var fieldset = $(target).attr('fieldset');
	if (!fieldset)
	{
		$.error('bind action requires fieldset attribute');
		return this;
	}
	
	var fields = this.find('[fieldset='+fieldset+']');
	$.each(fields, function()
	{
		var fieldId = this.getAttribute('name') || this.getAttribute('id');
		var fieldData = $.getNestedProperty(params,name,null)
		$(this).value(params,fieldId,fieldData)
	});
	
	return this;
});

