App.selectors = [];
var actions = {};

function addCond(el,name,handler)
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

function iterateActions(f,el,state)
{
	if (f)
	{
		var e = $(el);
		$.each(f,function()
		{
			var v = e.attr(this);
			if (v)
			{
				actions[this].apply(el,[v,state]);
			}
		});
	}
}

function getTarget(params,t)
{
	return (params.id)?$("#" + params.id):t;
}

function regCSSAction(name,key,value)
{
	App.regAction(evtRegex(name),function(params)
	{
		if (typeof(key)=='function')
		{
			return key.call(getTarget(params,this),params);
		}
		else
		{
			return getTarget(params,this).css(key,value||name);
		}
	});
}

App.executeActions = function(el,state)
{
	iterateActions(actions[el],el,state);
	iterateActions(actions['*'],el,state);
};

App.reg = function(name,el,handler)
{
	if (typeof(el)=='string')
	{
		el = $.makeArray(el);
	}

	$.each(el,function()
	{
		addCond(this,name,handler);
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

var actionRE = /\^([\w]+)\(/;

App.regAction = function(name,fn)
{
	$.debug('adding action ' + name)
	
	var m = actionRE.exec(String(name));
	if (m && m.length > 1 || typeof(name)=='string')
	{
		var fnName = m.length > 1 ? m[1] : name;
		if (typeof($.fn[fnName])!='function' && /\w/.test(fnName))
		{
			$.debug('registering plugin '+fnName);
			//
			// attempt to create a plugin with the same name of the action
			// so that you can programatically call the same action such
			// as: $('#foo').highlight()
			//
			$.fn[fnName] = function(params)
			{
				return fn.call(this,params||{});
			};
		}
	}
	regp.ractions.push({re:name,fn:fn});
};

function invoke (name,params)
{
	var scope = this;
	var found = false;
	$.each(regp.ractions,function()
	{
		if (this.re.test(name))
		{
			found = true;
			this.fn.apply(scope,[params,name]);
			return false;
		}
	});
	if (!found)
	{
		var fn = $(this)[name];
		if (fn)
		{
			fn.apply(scope,[params]);
		}
		else
		{
			$.error("couldn't find an action named: "+name+" for target: "+$(this).attr('id'));
		}
	}
};

App.triggerAction = function(scope,params,meta)
{
	var data = meta.actionParams;
	var action = meta.action;
	if (meta.ifCond)
	{
		var r = eval(meta.ifCond);
		if (r)
		{
			if (typeof(r)=='boolean')
			{
				r = (r===true);
			}
		}
		if (!r)
		{	
			action = meta.elseAction;
			data = meta.elseActionParams;
		}
	}
	if (action)
	{
		var newparams = params || {};
		if (data)
		{
			for (var x=0;x<data.length;x++)
			{
				var entry = data[x];
				var key = entry.key, value = entry.value;
				if (entry.keyExpression)
				{
					key = App.getEvaluatedValue(entry.key,null,params,entry.keyExpression);
				}
				else if (entry.valueExpression)
				{
					value = App.getEvaluatedValue(entry.value,null,params,entry.valueExpression);
				}
				else if (entry.empty)
				{
					value = App.getEvaluatedValue(entry.key,null,params);
				}
				else
				{
					key = App.getEvaluatedValue(entry.key);
					value = App.getEvaluatedValue(entry.value,null,params);
				}
				newparams[key]=value;
			}		
		}
		$.debug('invoking action: '+action+' with: '+$.toJSON(newparams)+", scope="+$(scope).attr('id'));
		$(scope).delay(function(){ invoke.apply(scope,[action,newparams]) },meta.delay/1000);
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
		App.regAction(evtRegex(name),function(params)
		{
			var c = dyn.actions[name];
			var scope = getTarget(params,this);
			if (c)
			{
				// already pending
				return c.push({scope:scope,params:params});
			}

			dyn.actions[name]=[{scope:scope,params:params}];

			$.debug('remote loading action = '+path);
			$.getScript(path);
		});
	});
};