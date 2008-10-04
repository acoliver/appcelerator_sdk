regCSSAction('highlight',function(params)
{
	var bgColor = params['background-color'] || '#ffffcc';
	var curBgColor = this.css('backgroundColor');
	this.animate({'backgroundColor':bgColor},50).animate({'backgroundColor':curBgColor},1000);
});
	

