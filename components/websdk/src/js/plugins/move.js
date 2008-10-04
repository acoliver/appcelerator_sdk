regCSSAction('move',function(params)
{
	this.css('position','relative').animate({
		left:params.x||0,
		top:params.y||0
	},params.duration||1000);
});
	

	

