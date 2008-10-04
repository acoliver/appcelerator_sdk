App.regAction(new RegExp('^hidden(\\[(.*)?\\])?$'),function(params)
{
	var target =  (params['id'])?$("#" + params['id']):this;
	target.css({'visibility':'hidden'})
	
});
	
