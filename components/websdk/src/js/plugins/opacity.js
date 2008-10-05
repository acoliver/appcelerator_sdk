regCSSAction('opacity',function(params)
{
	var value = (typeof(params)=='string'||typeof(params)=='number') ? params : (params ? params.value : null);
	if (typeof(value)=='undefined' && params)
	{
		for (var p in params)
		{
			if (p=='id' || p=='source') continue;
			value = params[p];
			break;
		}
	}
	if (typeof(value)=='undefined') value=1;
	if (typeof(value)!='number')
	{
		value = parseFloat(value);
	}
	this.css('opacity',(value==1||value=='') ? '1.0' : (value < 0.00001) ? 0 : value);
});


