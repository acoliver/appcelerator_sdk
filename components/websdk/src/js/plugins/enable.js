$.fn.enable = function()
{
	$.each(this,function()
	{
		$(this).removeAttr('disabled');
	});
}