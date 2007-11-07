Appcelerator.Compiler.registerAttributeProcessor('*','on',
{
	handle: function(element,attribute,value)
	{
		if (value)
		{
			Appcelerator.Compiler.parseOnAttribute(element);
		}
	}
});