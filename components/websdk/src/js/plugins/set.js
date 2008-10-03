var components = 
{
	controls:{},
	themes:{},
	behaviors:{},
	layouts:{}
};

AppC.register = function(type,name,fn)
{
	$.debug('register ' +type+':' +name +', fn:'+fn);
	var e = components[type+'s'][name];
	if (!e)
	{
		// in case you call directly
		e={pend:[],factory:fn};
		components[type+'s'][name]=e;
	}
	e.factory = fn;
};

function createControl(el,name,opts,fn)
{
	var e = components.controls[name];
	if (e)
	{
		var instance = e.factory.create();
		el.data('control',instance);
		return instance;
	}
	e = {pend:[{el:el,fn:fn,opts:opts}],factory:null}
	components.controls[name]=e;
	load('control',name,e);
}

function load(type,name,e)
{
	$.getScript(AppC.docRoot + 'components/'+type+'s/'+name+'/'+name+'.js',function()
	{
		var e = components.controls[name];
		$.each(e.pend,function()
		{
			var instance = createControl(this.el,name,this.opts,this.fn);
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
			};
			this.el.trigger('created',[instance,this.opts]);
			$.each(instance.getAttributes(),function()
			{
				switch (this.type)
				{
					case AppC.Types.condition:
					{
						var name = 'on' + $.proper(this.name);
						App.regCond(new RegExp('^('+this.name+')$'),function(meta)
						{
							el.bind(name,function(args)
							{
								var scope = $(this);
								args = args || {};
								args.id = $(this).attr('id');
								App.triggerAction(scope,args,meta);
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
			
			instance.render.call(instance,this.el,opts);
		});
	});
}

$.fn.control = function(name,opts,fn)
{
	if (arguments.length == 0)
	{
		return $(this).data('control');
	}
	createControl($(this),name,opts,fn);
};

$.fn.theme = function(name,options)
{

};

$.fn.behavior = function(name,options)
{

};

$.fn.layout = function(name,options)
{

};


$.fn.set = function(value,state)
{
	var el = $(this);
	el.data('compiled',false);

	var visibility = el.css('visibility') || 'visible';
	var show = false, initial = true;

	if (visibility == 'visible')
	{
		el.css('visibility','hidden');
		show = true;
	}

	el.addClass('container');

	el.bind('rendered',function()
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
			el.removeData('compiled');
			App.checkState(state,el);
			$.info('called final compiled for '+el.get(0));
		}
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
		$.debug('type='+type+',ui='+ui+',args='+$.toJSON(args));
		el[ui](type,args);
	});
};

App.reg('set','*',function(value,state)
{
	$(this).set(value,state);
});


