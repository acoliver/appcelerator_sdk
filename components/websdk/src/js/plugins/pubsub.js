
var subs = {local:[], remote:[]};
var re = /^(l|local|both|r|remote|\*)\:(.*)$/;
var local = /^l|local|both|\*/;

$.fn.sub = function(name,fn)
{
	//TODO: regular expressions
	
	var m = re.exec(name);
	
	if (local.test(m[1]))
	{
		subs.local.push({scope:this,fn:fn,name:m[2]});
	}
	else
	{
		subs.remote.push({scope:this,fn:fn,name:m[2]});
	}
	return this;
};

$.fn.pub = function(name,data)
{
	var el = this;
	var m = re.exec(name);
	var a = local.test(m[1]) ? subs.local : subs.remote;
	$.each(a,function()
	{
		if (this.name == m[2])
		{
			this.fn.call(this.scope,data);
		}
	});
	return this;
};

$.fn.after = function(fn,delay)
{
	var scope = this;
	setTimeout(function(){ 
		fn.call(scope);
	},(delay||0.1));
	return this;
};

//TODO: remote

App.regCond(re,function(cond,action,elseAction,delay,ifCond)
{
	$(this).sub(cond,function(data)
	{
		App.triggerAction(this,data,cond,action,elseAction,delay,ifCond);
	});
});

App.regAction(/^(l|local|both|\*|r|remote)\:/,function(params,action)
{
	console.debug('params = '+$.toJSON(params));
	$(this).pub(action,params);
});
