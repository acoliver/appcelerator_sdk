App.selectors = [];
App.delegateCompilers = [];
var actions = {};

function addCond(tag,attr,handler,delegate)
{
	var wildcard = tag=='*';
	tag = wildcard ? tag.toLowerCase() : tag;
	var found = actions[tag];
	if (!found)
	{
		found = [];
		actions[tag]=found;
	}
	var isExpr = attr.indexOf('=') > 0;
	found.push({tag:tag,wildcard:wildcard,attr:attr,expr:isExpr,fn:handler,delegate:delegate});
	var expr = tag + '[' + (!isExpr ? '@' : '') + attr + ']';
	App.selectors.push(expr);
	if (delegate) App.delegateCompilers.push(expr);
}

function getTagName(el)
{
	var element = $(el).get(0);
	if (AppC.UA.IE)
	{
		if (element.scopeName && element.tagUrn)
		{
			return (element.scopeName + ':' + element.nodeName).toLowerCase();
		}
	}
	return element.nodeName.toLowerCase();
}

function iterateActions(f,el,tag,state)
{
	if (f)
	{
		var e = $(el);
		var delegateCompile = false;
		$.each(f,function()
		{
			if (this.wildcard || tag == this.tag)
			{
				if (!this.expr)
				{
					var v = e.attr(this.attr);
					if (v)
					{
						var r = this.fn.apply(e,[v,state,tag]);
						if (typeof(r)=='undefined') r=true;
						if (r && this.delegate) delegateCompile = true;
					}
				}
				else
				{
					var r = this.fn.apply(e,[tag,state]);
					if (typeof(r)=='undefined') r=true;
					if (r && this.delegate) delegateCompile = true;
				}
			}
		});
		return delegateCompile; 
	}
	return false;
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
	var tag = getTagName(el);
	var r1 = iterateActions(actions[tag],el,tag,state);
	var r2 = iterateActions(actions['*'],el,tag,state);
	return !(r1 || r2);
};

App.reg = function(name,el,handler,delegateCompile)
{
	if (typeof(el)=='string')
	{
		el = $.makeArray(el);
	}

	$.each(el,function()
	{
		addCond(this,name,handler,delegateCompile);
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
				var r = fn.call(this,params||{});
				if (typeof(r)!='undefined') return r;
				return this;
			};
		}
	}
	regp.ractions.push({re:name,fn:fn});
};

App.invokeAction=function(name,params)
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
		$(scope).delay(function(){ App.invokeAction.apply(scope,[action,newparams]) },meta.delay/1000);
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