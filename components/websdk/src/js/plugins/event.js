var events = ['blur','click','change','dblclick','focus','keydown','keyup','keypress','mousedown','mousemove','mouseout', 'moveover', 'mouseup', 'resize', 'scroll','select','submit'];


// register event handlers
$.each(events,function()
{
	var name = $.string(this);
	var scope = this;
	App.regAction(name,function(params)
	{
		$(this)[name].call(scope);
	});
});


App.regCond(new RegExp('^('+events.join('|')+')$'),function(cond,action,elseAction,delay,ifCond)
{
	$(this)[cond](function()
	{
		var scope = $(this);
		App.triggerAction(scope,{id:$(this).attr('id')},cond,action,elseAction,delay,ifCond);
	});
});
