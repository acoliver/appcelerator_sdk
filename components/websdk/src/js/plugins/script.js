
$.each(['script','function','javascript'],function()
{
	$.fn[this]=function(code,scope)
	{
		var js = code;
		if (typeof(js)=='string')
		{
			js = $.toFunction(js);
		}
		else if (code.nodeType==1)
		{
			js = $.toFunction($(code).html());
		}
		else if (typeof(code.jquery)=='string')
		{
			js = $.toFunction(code.get(0).html());
		}
		else
		{
			throw "I don't know what this object is: "+(typeof(code))+" for "+$(this).attr('id');
		}
		js.call(scope||window);
		return this;
	};
});

