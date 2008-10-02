var components = 
{
	controls:{},
	themes:{},
	behaviors:{},
	layouts:{}
};

AppC.register = function(type,name,fn)
{
	console.debug('register ' +type+':' +name +', fn:'+fn);
	var e = components[type+'s'][name];
	if (!e)
	{
		// in case you call directly
		e={pend:[],factory:fn};
		components[type+'s'][name]=e;
	}
	e.factory = fn;
	console.debug('set '+e.factory);
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
			instance.render();
		});
	});
}

$.fn.control = function(name,opts,fn)
{
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


$.fn.set = function(value)
{
	var el = $(this);
	el.data('stopCompile',true);

	var visibility = el.css('visibility') || 'visible';
	var show = false;

	if (visibility == 'visible')
	{
		el.css('visibility','hidden');
		show = true;
	}

	el.addClass('container');

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
		console.debug('type='+type+',ui='+ui+',args='+$.toJSON(args));
		el[ui](type,args);
	});

	/*
	var count = 0;
	var compiler = function(instance)
	{
		count++;
		element._component = instance;
		instance.onEvent('render',function(ev)
		{
			if (show)
			{
				element.style.visibility = element.style._visibility;
				show = false;
			}
		});
		instance.render(element);
		if (count == expressions.length)
		{
			Appcelerator.Compiler.parseOnAttribute(element);
			Appcelerator.Compiler.compileElementChildren(element);
		}
		element.state.pending-=1;
	    Appcelerator.Compiler.checkLoadState(element);
	};*/
};

App.reg('set','*',function(value)
{
	$(this).set(value);
});


