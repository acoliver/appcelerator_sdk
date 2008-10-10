
$.each(['script','function','javascript'],function()
{
	App.regAction(evtRegex(this),function(params,name,data)
	{
		var fn = data.toFunction();
		fn.call(params);
	},true);
});
