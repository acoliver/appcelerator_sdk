//
// for IE6, we need to apply a PNG transparency fix
//

Appcelerator.Compiler.Image = {};

Appcelerator.Compiler.registerAttributeProcessor('img','srcexpr',
{
	handle: function(img,attribute,value)
	{
		if (value)
		{
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
		}
	}
});