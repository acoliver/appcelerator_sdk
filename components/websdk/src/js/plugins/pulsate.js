regCSSAction('pulsate',function(params)
{
	for (var i=0;i<(params.count||4);i++)
	{
		this.fadeOut('fast').fadeIn('fast');
	}
});
