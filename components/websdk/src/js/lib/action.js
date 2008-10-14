App.selectors = [];
App.delegateCompilers = [];
var actions = {};

function addProcessor(tag,attr,handler,delegate,priority)
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
	found[priority?'unshift':'push']({tag:tag,wildcard:wildcard,attr:attr,expr:isExpr,fn:handler,delegate:delegate});
	var expr = tag + '[' + (!isExpr ? '@' : '') + attr + ']';
	App.selectors[priority?'unshift':'push'](expr);
	if (delegate) App.delegateCompilers[priority?'unshift':'push'](expr);
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

function iterateProcessors(f,el,tag,state)
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
			if (delegateCompile) return false;
		});
		return delegateCompile; 
	}
	return false;
}

function getTarget(params,t)
{
	if (!params) return t;
	if (params.target)
	{
		return $(params.target)
	}
	return (params.id)?$("#" + params.id):t;
}

function regCSSAction(name,key,value)
{
	App.regAction(evtRegex(name),function(params)
	{
		$.fn[name] = function(o)
		{
			if (typeof(key)=='function')
			{
				return key.call(getTarget(o,this),o);
			}
			else
			{
				return getTarget(o,this).css(key,value||name);
			}
		}
	});
}

App.runProcessors = function(el,state)
{
	var tag = getTagName(el);
	var r1 = iterateProcessors(actions[tag],el,tag,state);
	var r2 = iterateProcessors(actions['*'],el,tag,state);
	return !(r1 || r2);
};

App.reg = function(name,el,handler,delegateCompile,priority)
{
	if (typeof(el)=='string')
	{
		el = $.makeArray(el);
	}

	$.each(el,function()
	{
		addProcessor(this,name,handler,delegateCompile,priority);
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
var actionUnparsers = {};
App.parseParams = function(name)
{
	var f = actionUnparsers[name];
	return typeof(f)=='undefined';
};

App.regAction = function(name,fn,dontparse)
{
	dontparse = typeof(dontparse)=='undefined' ? false : (dontparse===true);

	$.debug('adding action ' + name+', dontparse = '+dontparse);
	
	var m = actionRE.exec(String(name));
	if (m && m.length > 1 || typeof(name)=='string')
	{
		var fnName = m.length > 1 ? m[1] : name;
		if (dontparse) actionUnparsers[fnName]=1;
		var f = $.fn[fnName];
		if (typeof(f)!='function')
		{
			//FIXME
			//throw "attempt to register action which doesn't have a registered plugin with same name: "+fnName;
		}
		if (f)
		{
			// remap it
			var mapFnName = '_'+fnName;
			$.fn[mapFnName] = f;
			$.fn[fnName] = function()
			{
				if (!f) return; //FIXME
				var r = f.apply(this,arguments);
				this.trigger(fnName); // trigger an event when action is invoked
				return r || this;
			};
		}
		
		/*
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
				this.trigger(fnName); // trigger an event when action is invoked
				if (typeof(r)!='undefined') return r;
				return this;
			};
		}*/
	}
	regp.ractions.push({re:name,fn:fn,dontparse:dontparse});
};

App.makeCustomAction=function(el,value)
{
	var p = App.extractParameters(value);
	var meta = 
	{
		action: p.name,
		actionParams: p.params,
		delay:0,
		ifCond:null
	};
	actions[meta.action]=meta;
	return meta;
};

App.invokeAction=function(name,data,params)
{
	$.debug("invokeAction called with "+name);
	var scope = this;
	var found = false;
	$.each(regp.ractions,function()
	{
		if (this.re.test(name))
		{
			found = true;

			var newparams = params || {};
			if (data && !this.dontparse)
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
			else if (data && this.donparse)
			{
				newparams = params;
			}
			$.debug('invoking action: '+name+' with: '+$.toJSON(newparams)+", scope="+$(scope).attr('id'));
			this.fn.apply(scope,[newparams,name,data]);
			return false;
		}
	});
	if (!found)
	{
		var fn = typeof(name)=='function' ? name : $(this)[name];
		if (fn)
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
			$.debug('invoking action: '+name+' with: '+$.toJSON(newparams)+", scope="+$(scope).attr('id'));
			fn.apply(scope,[newparams,name,params]);
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
		if (meta.delay > 0)
		{
			$(scope).delay(function(){ App.invokeAction.apply(scope,[action,data,params]) },meta.delay/1000);
		}
		else
		{
			App.invokeAction.apply(scope,[action,data,params]);
		}
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


function convertParams(params)
{
	if (arguments.length == 2 && typeof(params)=='string')
	{
		// allow $('div').set('background-color','blue');
		var key = arguments[0];
		var value = arguments[1];
		params = {
			key: value
		};
	}
	return params;
}
