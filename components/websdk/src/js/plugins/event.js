var events = ['blur','click','change','dblclick','focus','keydown','keyup','keypress','mousedown','mousemove','mouseout', 'moveover', 'mouseup', 'resize', 'scroll','select','submit'];


// register event handlers
$.each(events,function()
{
	var name = $.string(this);
	var scope = this;
	App.regAction(new RegExp('^'+name+'(\\[(.*)?\\])?$'),function(params)
	{
		$.info('action id =>' + $.toJSON(params))
		return (params.id)?
				$("#"+params.id)[name].call(scope):
				$(this)[name].call(scope);
	});
});

App.regCond(new RegExp('^('+events.join('|')+')[!]?$'),function(meta)
{
	var stop = false;
	var cond = meta.cond;
	if (cond.charAt(cond.length-1)=='!')
	{
		cond = cond.substring(0,cond.length-1);
		stop = true;
	}
	$(this)[cond](function(e)
	{
		var scope = $(this);
		var data = {source:$(this).attr('id'),x:e.pageX,y:e.pageY};
		$.debug('sending '+cond+', data = '+$.toJSON(data));
		App.triggerAction(scope,data,meta);
		if (stop) e.stopPropagation();
	});
});

App.regCond(/^compiled$/,function(meta)
{
	$(this).bind('compiled',function()
	{
		var scope = $(this);
		var data = {source:$(this).attr('id')};
		App.triggerAction(scope,data,meta);
	});
});
