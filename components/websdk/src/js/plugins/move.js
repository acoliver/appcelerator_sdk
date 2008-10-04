App.regAction(new RegExp('^move(\\[(.*)?\\])?$'),function(params)
{
	var target =  (params['id'])?$("#" + params['id']):this;
	var x = params['x'] || '0px';
	var y = params['y'] || '0px';
	var duration = params['duration'] || 1000;
	target.css({'position':'relative'});
	target.animate({left:x,top:y},duration);
	
});
	

