regCSSAction('pulsate',function(params)
{
	for (var i=0;i<5;i++)
	{
		this.fadeOut('fast').fadeIn('fast');
	}
});
