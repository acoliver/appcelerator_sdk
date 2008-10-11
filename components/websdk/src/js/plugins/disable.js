$.fn.disable = function()
{
	$.each(this,function(idx)
	{
		$(this).attr('disabled',true);
	});
};