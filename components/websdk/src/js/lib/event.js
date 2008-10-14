var events = ['blur','click','change','dblclick','focus','keydown','keyup','keypress','mousedown','mousemove','mouseout', 'mouseover', 'mouseup', 'resize', 'scroll','select','submit'];

function evtRegex(name)
{
	return new RegExp('^'+name+'(\\[(.*)?\\])?$');
}

App.regCond(new RegExp('^('+events.join('|')+')[!]?$'),function(meta)
{
	var stop = false;
	var cond = meta.cond;
	if (cond.charAt(cond.length-1)=='!')
	{
		cond = cond.substring(0,cond.length-1);
		stop = true;
	}
	var fn = function(e)
	{
		var scope = $(this);
		var data = App.getFieldsetData(scope);
		data.event = {id:$(this).attr('id'),x:e.pageX,y:e.pageY};
		$.debug('sending '+cond+', data = '+$.toJSON(data));
		App.triggerAction(scope,data,meta);
		if (stop)
		{
			e.stopPropagation();
			return false;
		}
	};
	this.bind(cond,fn);
	this.trash(function()
	{
		this.unbind(cond,fn);
	});
});

App.regCond(/^compiled$/,function(meta)
{
	var fn = function()
	{
		var scope = $(this);
		var data = {event:{id:$(this).attr('id')}};
		App.triggerAction(scope,data,meta);
	};
	this.bind('compiled',fn);
	this.trash(function()
	{
		this.unbind('compiled',fn);
	});
});
