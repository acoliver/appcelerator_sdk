Appcelerator.Compiler.registerAttributeProcessor('*','on',
{
	handle: function(element,attribute,value)
	{
		if (value)
		{
		    if (element.getAttribute('set') != '') 
		    {
		        return;
		    }
			Appcelerator.Compiler.parseOnAttribute(element);
		}
	},
	metadata:
	{
		description: (
	 	"Contains a Web Expression: a mapping between event triggers and actions. "+
		"Independent trigger/action pairs can be join with the <b>or</b> keyword.<br/> "+
		"Multiple actions for a single trigger can be combined with the <b>and</b> keyword.<br/> "+
		""
		)
	}
});