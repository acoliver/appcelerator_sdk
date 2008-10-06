App.reg('srcexpr','img',function(value,state)
{
	var img = $(this).get(0);
	try
	{
		var srcvalue = eval(String.unescapeXML(value));
		if (Appcelerator.Browser.isIE6)
		{
			img.onload = function()
			{
				img.addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');
			};
		}
		img.src = srcvalue;
	}
	catch(e)
	{
		Appcelerator.Compiler.handleElementException(img, e, 'setting img srcexpr using expression = ' + value);
	}
});
