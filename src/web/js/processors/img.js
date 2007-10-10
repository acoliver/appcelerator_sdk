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
			var code='var functionString_'+img.id+' = (function(){return '+String.unescapeXML(value)+'})();';
			code+="if (Appcelerator.Browser.isIE6){";
			code+='Appcelerator.Browser.fixImage("'+img.id+'",functionString_'+img.id+');';
			code+="}else{";
			code+='$("'+img.id+'").src = functionString_'+img.id+';';
			code+="}";
			return code;
		}
	}
});