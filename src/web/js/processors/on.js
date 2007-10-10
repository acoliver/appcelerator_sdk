Appcelerator.Compiler.registerAttributeProcessor('*','on',
{
	handle: function(element,attribute,value)
	{
		if (value)
		{
			return Appcelerator.Compiler.compileExpression(element,value,false);
		}
		return null;
	}
});