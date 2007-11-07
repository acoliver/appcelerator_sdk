//
// for IE6, we need to apply a PNG transparency fix
//

Appcelerator.Compiler.Image = {};

if (Appcelerator.Browser.isIE6)
{
	Appcelerator.Compiler.registerAttributeProcessor('img','src',
	{
		handle: function(img,attribute,value)
		{
			if (value)
			{
	    		Appcelerator.Browser.fixImage(img,value);
			}
		}
	});
}

Appcelerator.Compiler.registerAttributeProcessor('img','srcexpr',
{
	handle: function(img,attribute,value)
	{
		if (value)
		{
			img.src = eval(String.unescapeXML(value));
			
			if (Appcelerator.Browser.isIE6)
			{
				Appcelerator.Browser.fixImage(img,img.src);
			}
		}
	}
});