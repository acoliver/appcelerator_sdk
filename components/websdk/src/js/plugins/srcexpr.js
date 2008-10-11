
$.fn.srcexpr = function(value)
{
	var srcvalue = eval($.unescapeXML(value));
	if (AppC.UA.IE6)
	{
		//FIXME
		// img.onload = function()
		// {
		// 	img.addBehavior(AppC.compRoot + '/images/appcelerator/iepngfix.htc');
		// };
	}
	$(this).get(0).src = srcvalue;
	return this;
};