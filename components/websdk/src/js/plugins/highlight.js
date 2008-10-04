App.regAction(new RegExp('^highlight(\\[(.*)?\\])?$'),function(params)
{
	var target =  (params['id'])?$("#" + params['id']):this;
	var bgColor = params['background-color'] || '#ffffcc';
	var curBgColor = target.css('background-color');
	target.animate({'backgroundColor':bgColor},50);
	target.animate({'backgroundColor':curBgColor},1000);

});
	

