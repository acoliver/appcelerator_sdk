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
	},
	metadata:
	{
		description: (
		"Groups fields together. Messages sent from an element with a <i>fieldset</i> "+
		"will contain a payload built from all the elements in the fieldset.<br/>"+
		"The keys of the payload will be the names (or, lacking names, the ids) of the fieldset elements "+
		"and the payload values will be the result of Appcelerator.Compiler.getInputFieldValue() on each element."
		)
	}
});
