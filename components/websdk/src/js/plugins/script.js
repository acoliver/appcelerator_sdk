
$.each(['script','function','javascript'],function()
{
	$.fn[this]=function(code,scope)
	{
		scope = scope || {};
		var js = code;
		if (typeof(js)=='string')
		{
			js = $.toFunction(js,true);
		}
		else if (code.nodeType==1)
		{
			js = $.toFunction($(code).html(),true);
		}
		else if (typeof(code.jquery)=='string')
		{
			js = $.toFunction(code.get(0).html(),true);
		}
		else
		{
			throw "I don't know what this object is: "+(typeof(code))+" for "+$(this).attr('id');
		}
		scope.window = window;
		this.result = js.call(scope);
		return this;
	};
});

