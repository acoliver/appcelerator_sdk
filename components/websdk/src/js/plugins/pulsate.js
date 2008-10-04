App.regAction(new RegExp('^pulsate(\\[(.*)?\\])?$'),function(params)
{
	var target =  (params['id'])?$("#" + params['id']):this;
	for (var i=0; i<5;i++)
	{
		target.fadeOut('fast').fadeIn('fast');
	}
	
});
	

