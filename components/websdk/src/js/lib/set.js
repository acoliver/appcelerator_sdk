var components = 
{
	controls:{},
	themes:{},
	behaviors:{},
	layouts:{}
};

AppC.register = function(type,name,fn)
{
	var e = components[type+'s'][name];
	if (!e)
	{
		// in case you call directly
		e={pend:[],factory:fn};
		components[type+'s'][name]=e;
	}
	e.factory = fn;
	$.each(e.pend,function()
	{
		var instance = createControl(this.el,name,this.opts,this.fn);
		if (!instance) $.error("framework error - instance not returned from factory for: "+name);
		var render = instance.render;
		var el = this.el;
		var opts = this.opts;
		instance.render = function()
		{
			if (arguments.length == 1)
			{
				render.apply(instance,[el,arguments[0]]);
			}
			else
			{
				render.apply(instance,arguments);
			}
			el.trigger('rendered',instance);
		};
		el.data('control',instance);
		el.trigger('created',[instance,this.opts]);
		$.each(instance.getAttributes(),function()
		{
			switch (this.type)
			{
				case AppC.Types.condition:
				{
					var name = 'on' + $.proper(this.name);
					App.regCond(new RegExp('^('+this.name+')$'),function(meta)
					{
						var bindFn = function(args)
						{
							var scope = $(this);
							args = args || {};
							args.id = $(this).attr('id');
							App.triggerAction(scope,args,meta);
						};
						el.bind(name,bindFn);
						el.trash(function()
						{
							el.unbind(name,bindFn);
						});
					});
					break;
				}
				case AppC.Types.action:
				{
					//FIXME
					break;
				}
				default:
				{
					var v = opts[this.name] || this.defaultValue;
					if (typeof(v)=='undefined' && !this.optional)
					{
						el.trigger('onError',"required property '"+this.name+"' not found or missing value");
						//FIXME
					}
					opts[this.name]=v;
				}
			}
		});
		
		// call the function callback if passed in
		if (this.fn) this.fn.call(instance,opts);

		instance.render.apply(instance,[this.el,opts]);
	});
};

function createControl(el,name,opts,fn)
{
	var e = components.controls[name];
	opts = opts || {};
	if (e)
	{
		if (!e.factory)
		{
			e.pend.push({el:el,fn:fn,opts:opts});
			return;
		}
		var instance = e.factory.create();
		return instance;
	}
	e = {pend:[{el:el,fn:fn,opts:opts}],factory:null}
	components.controls[name]=e;
	load('control',name,e);
}

function load(type,name,e)
{
	var uri = AppC.sdkPath + 'components/'+type+'s/'+name+'/'+name+'.js';
	$.getScript(uri);
}

$.fn.control = function(name,opts,fn)
{
	if (arguments.length == 0)
	{
		return this.data('control');
	}
	// 2nd argument can be the callback function, in which case
	// we're not passing in parameters
	if (typeof(opts)=='function')
	{
		fn = opts;
		opts = {};
	}
	createControl($(this),name,opts,fn);
	return this;
};

$.fn.theme = function(name,options)
{
	return this;
};

$.fn.behavior = function(name,options)
{
	return this;
};

$.fn.layout = function(name,options)
{
	return this;
};


App.reg('set','*',function(value,state)
{
	var el = $(this);
	var visibility = el.css('visibility') || 'visible';
	var show = false, initial = true;

	if (visibility == 'visible')
	{
		el.css('visibility','hidden');
		show = true;
	}

	el.addClass('container');

	var bindFn = function()
	{
		el.compileChildren(state,false);
		if (show)
		{
			$(this).css('visibility',visibility);
			show=false;
		}
		if (initial)
		{
			initial=false;
			App.checkState(state,el);
		}
	};
	el.bind('rendered',bindFn);
	el.trash(function()
	{
		el.unbind('rendered',bindFn);
	});
	
	$.each($.smartSplit(value,' and '),function()
	{
		var idx = this.indexOf('[');
		if (idx < 0)
		{
			throw new "invalid set expression. must be in the form: control[type]";
		}
		var lastIdx = this.lastIndexOf(']');
		var ui = this.substring(0,idx);
		var params = this.substring(idx+1,lastIdx);
		var comma = params.indexOf(',');
		var type = null, args = {};
		if (comma < 0)
		{
			type = params;
		}
		else
		{
			type = params.substring(0,comma);
			args = App.getParameters(params.substring(comma+1),true);
			for (var p in args)
			{
				args[p] = App.getEvaluatedValue(args[p]);
			}
		}
		$.info('creating component of type='+type+',ui='+ui+',args='+$.toJSON(args));
		el[ui](type,args);
	});

},true);


