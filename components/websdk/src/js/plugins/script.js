
$.each(['script','function','javascript'],function()
{
	App.regAction(evtRegex(this),function(params,name,data)
	{
		var fn = $(this).data('codefn');
		if (!fn)
		{
			fn = data.toFunction();
			$(this).data('codefn',fn);
		}
		fn.call(params);
	},true);
});
