// 
// register our fieldsets
// 
Appcelerator.Compiler.registerAttributeProcessor(['textarea','input','select'],'fieldset',
{
	handle: function(element,attribute,value)
	{
		if (value && element.getAttribute('type')!='button')
		{
			// see if we're part of a field set and if so, add
			// our reference
			//
			return 'Appcelerator.Compiler.addFieldSet($("'+element.id+'"),false);';
		}
	}
});
