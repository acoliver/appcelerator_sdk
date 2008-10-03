var events = ['blur','click','change','dblclick','focus','keydown','keyup','keypress','mousedown','mousemove','mouseout', 'moveover', 'mouseup', 'resize', 'scroll','select','submit'];


// register event handlers
$.each(events,function()
{
	var name = $.string(this);
	var scope = this;
	App.regAction(name,function(params)
	{
		//TODO: add support for action on passed in ID
		$(this)[name].call(scope);
	});
});

App.regCond(new RegExp('^('+events.join('|')+')[!]?$'),function(cond,action,elseAction,delay,ifCond)
{
	var stop = false;
	if (cond.charAt(cond.length-1)=='!')
	{
		cond = cond.substring(0,cond.length-1);
		stop = true;
	}
	$(this)[cond](function(e)
	{
		var scope = $(this);
		var data = {id:$(this).attr('id'),x:e.pageX,y:e.pageY};
		$.debug('sending '+cond+', data = '+$.toJSON(data));
		App.triggerAction(scope,data,cond,action,elseAction,delay,ifCond);
		if (stop) e.stopPropagation();
	});
});

App.regCond(/^compiled$/,function(cond,action,elseAction,delay,ifCond)
{
	$(this).bind('compiled',function()
	{
		var scope = $(this);
		var data = {id:$(this).attr('id')};
		App.triggerAction(scope,data,cond,action,elseAction,delay,ifCond);
	});
});
