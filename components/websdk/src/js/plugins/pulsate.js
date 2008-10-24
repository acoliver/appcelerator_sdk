$.fn.pulsate = function(count)
{
	for (var i=0;i<(count||4);i++)
	{
		this.fadeOut('fast').fadeIn('fast');
	}
	return this;
};

regCSSAction('pulsate',function(params)
{
	return getTarget(params,this).pulsate(params.count);
});
