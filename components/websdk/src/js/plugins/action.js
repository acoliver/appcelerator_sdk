App.selectors = [];
var actions = {};

function addAction(el,name,handler)
{
	var found = actions[el];
	if (!found)
	{
		found = [];
		actions[el] = found;
	}
	found.push(name);
	App.selectors.push(el + '[@' + name + ']');
	actions[name]=handler;
}

function iterateActions(f,el)
{
	if (f)
	{
		var e = $(el);
		$.each(f,function()
		{
			var v = e.attr(this);
			if (v)
			{
				actions[this].call(el,v);
			}
		});
	}
}

App.executeActions = function(el)
{
	iterateActions(actions[el],el);
	iterateActions(actions['*'],el);
};

App.reg = function(name,el,handler)
{
	if (typeof(el)=='string')
	{
		el = $.makeArray(el);
	}

	$.each(el,function()
	{
		addAction(this,name,handler);
	});
};

var regp = {conds:{},actions:{},ractions:[]};
var dyn  = {conds:{},actions:{}};

App.dynloadAction = function(name,fn)
{
	// register it
	App.regAction(name,fn);

	// call any pending actions
	$.each(dyn.actions[name],function()
	{
		App.invokeAction(this.scope,name,this.params);
	});

	// remove it once loaded
	try { delete dyn.actions[name] } catch (E) { dyn.actions[name]=null; }
};

App.regAction = function(name,fn)
{
	if (typeof(name)=='string')
	{
		regp.actions[name]=fn;
	}
	else
	{
		regp.ractions.push({re:name,fn:fn});
	}
};

function invoke (name,params)
{
	var scope = this;
	var fn = regp.actions[name] || $(this)[name];
	if (fn)
	{
		fn.apply(scope,[params]);
	}
	else
	{
		$.each(regp.ractions,function()
		{
			if (this.re.test(name))
			{
				this.fn.apply(scope,[params,name]);
				return false;
			}
		});
	}
};

App.triggerAction = function(scope,data,cond,action,elseAction,delay,ifCond)
{
	if (ifCond)
	{
		var r = eval(ifCond);
		if (r)
		{
			if (typeof(r)=='boolean')
			{
				r = (r===true);
			}
		}
		if (!r) action = elseAction;
	}
	if (action)
	{
		$(scope).after(function(){ invoke.apply(scope,[action,data]) },delay);
	}
};

App.dynregAction = function(actions)
{
	$.each($.makeArray(actions),function()
	{
		var name = $.string(this);
		var path = AppC.pluginRoot + '/' + name + '_action.js';
		var found = regp.actions[path];
		if (found)
		{
			return App.regAction(name,found);
		}
		App.regAction(name,function(params)
		{
			var c = dyn.actions[name];
			if (c)
			{
				// already pending
				return c.push({scope:this,params:params});
			}

			dyn.actions[name]=[{scope:this,params:params}];

			console.debug('remote loading action = '+path);
			$.getScript(path);
		});
	});
};