
$.fn.on = function(value,state)
{
	var el = $(this);
	var isFn = typeof(state)=='function';
	if (isFn)
	{
		// if it's a function, we just fact the action so it'll parse
		// this means you can pass in a function and when the condition
		// is triggered, we'll call you function 
		value = value + ' then script[true]';
	}
	var expr = App.parseExpression(value);
	$.each(expr,function()
	{
		var p = App.extractParameters(this[2]);
		var ep = isFn ? null : this[3] ? App.extractParameters(this[3]) : null;
		var param = 
		{
			cond: this[1],
			action: isFn ? state : p.name,
			actionParams: isFn ? null : p.params,
			elseAction: ep ? ep.name : null,
			elseActionParams: ep ? ep.params : null,
			delay: this[4],
			ifCond: this[5],
			state: state
		};
		App.processCond(el,param);
	});
	return this;
};

