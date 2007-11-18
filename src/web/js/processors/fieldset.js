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
			Appcelerator.Compiler.addFieldSet(element,false);
		}		
        // autocomplete causes some problems with validators - turn off for now
        var auto = element.getAttribute('autocomplete');
        if (!auto)
        {
            element.setAttribute('autocomplete','off');
        }
	}
});
