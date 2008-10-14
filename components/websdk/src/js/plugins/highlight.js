$.fn.highlight = function(bgColor)
{
	bgColor = bgColor || '#ffffcc';
	$.each(this,function()
	{
		var curBgColor = $(this).css('backgroundColor');
		$(this).animate({'backgroundColor':bgColor},50).animate({'backgroundColor':curBgColor},1000);
	});
	return this;
};

