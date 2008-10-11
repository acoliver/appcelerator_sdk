$.fn.move = function(params)
{
	$.each(this,function()
	{
		$(this).css('position','relative').animate({
			left:params.x||0,
			top:params.y||0
		},params.duration||1000);
	});
}	

	

