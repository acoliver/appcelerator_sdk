
$.fn.on = function(value,state)
{
	var el = $(this);
	var expr = App.parseExpression(value);
	$.each(expr,function()
	{
		var p = App.extractParameters(this[2]);
		var ep = this[3] ? App.extractParameters(this[3]) : null;
		var param = 
		{
			cond: this[1],
			action: p.name,
			actionParams: p.params,
			elseAction: ep ? ep.name : null,
			elseActionParams: ep ? ep.params : null,
			delay: this[4],
			ifCond: this[5],
			state: state
		};
		App.processCond(el,param);
	});
};

App.reg('on','*',function(value,state)
{
	$(this).on(value,state);
});

