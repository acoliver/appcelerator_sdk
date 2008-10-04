App.regAction(new RegExp('^visible(\\[(.*)?\\])?$'),function(params)
{
	var target =  (params['id'])?$("#" + params['id']):this;
	target.css({'visibility':'visible'})
	
});
	
