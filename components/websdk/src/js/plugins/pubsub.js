
var subs = {local:[], remote:[]};
var re = /^(l|local|both|r|remote|\*)\:(.*)$/;
var local = /^l|local|both|\*/;

$.fn.sub = function(name,fn)
{
	//TODO: regular expressions
	var e = App.extractParameters(name);
	var params = App.getParameters(e.params,false);
	var type = e.name;
	var regexp = null;
	var m = re.exec(type);
	type = m[2];
	if (type.charAt(0)=='~')
	{
		regexp = true;
		type = type.substring(1);
	}
	
	if (local.test(m[1]))
	{
		subs.local.push({scope:this,fn:fn,name:type,params:params,regexp:new RegExp(type)});
	}
	else
	{
		subs.remote.push({scope:this,fn:fn,name:type,params:params,regexp:new RegExp(type)});
	}
	return this;
};

$.fn.pub = function(name,data)
{
	console.debug('publish '+name+' with '+$.toJSON(data));
	var el = this;
	var m = re.exec(name);
	var a = local.test(m[1]) ? subs.local : subs.remote;
	$.each(a,function()
	{
		if ((this.regexp && this.regexp.test(m[2])) || (!this.regexp && this.name == m[2]))
		{
			if (App.parseConditionCondition(this.params,data))
			{
				this.fn.call(this.scope,data);
			}
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
