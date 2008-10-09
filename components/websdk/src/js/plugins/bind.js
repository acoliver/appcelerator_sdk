App.regAction(evtRegex('binded'),function(params)
{
	$.info('this ' + typeof(this.attr) )
	var target = getTarget(params,this);
	$.info('target = ' + target + ' el ' + target.get(0))
	var fieldset = $(target).attr('fieldset');
	if (!fieldset)
	{
		$.error('bind action requires fieldset attribute');
		return this;
	}
	
	var fields = this.find('[fieldset='+fieldset+']');
	$.each(fields, function()
	{
		var fieldId = this.attr('name') || this.attr('id');
		var fieldData = $.getNestedProperty(params,name,null)
		$(this).value(params,fieldId,fieldData)
	});
	
	return this;
});

