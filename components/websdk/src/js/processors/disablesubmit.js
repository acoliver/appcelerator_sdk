// 
// register our fieldsets
// 
Appcelerator.Compiler.registerAttributeProcessor('form','disablesubmit',
{
	handle: function(element,attribute,value)
	{
		if (value == "true")
		{
			var input = document.createElement('input');
			input.type = 'text';
			input.style.display = 'none';
			input.name = 'disablesubmit';
			element.appendChild(input);
		}
	},
	metadata:
	{
		description: (
		"When set to true, then it will disable the form from auto-submit when a user hits enter."
		)
	}
});
