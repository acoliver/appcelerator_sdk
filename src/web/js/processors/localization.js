//
// register an attribute processor for langid that will replace
// the value of the element with the language bundle key value
// the langid attribute should equal the language bundle key
//
Appcelerator.Localization.AttributeProcessor = 
{
	handle: function(element,attribute,value)
	{
		if (value)
		{
			var v = Appcelerator.Localization.get(value);
			switch (Appcelerator.Compiler.getTagname(element))
			{
				case 'select':
				{
					element.options.length = 0;
					for (var c=0;c<v.length;c++)
					{
						var o = v[c];
						element.options[element.options.length]=new Option(o.value,o.id);
					}
					break;
				}
				case 'option':
				{
					if (typeof v == 'object')
					{
						element.text = v.value;
						element.value = v.id;
					}
					else
					{
						element.value = element.text = v;
					}
					break;
				}
				case 'input':
				{
					element.value = v;
					break;
				}
				default:
				{
					element.innerHTML = v;
					break;
				}
			}
		}
		return null;
	}
};
//
// do this on doc load instead of JS load so that the 
// application can change this in their own JS file
// as long as its before document is fulled loaded and 
// the compiler kicks in
//
Appcelerator.Core.onload(function()
{
	Appcelerator.Compiler.registerAttributeProcessor(Appcelerator.Localization.supportedTags,'langid',Appcelerator.Localization.AttributeProcessor);
},true);
