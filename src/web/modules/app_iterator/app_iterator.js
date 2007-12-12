
Appcelerator.Module.Iterator =
{
	getName: function()
	{
		return 'appcelerator iterator';
	},
	getDescription: function()
	{
		return 'iterator widget';
	},
	getVersion: function()
	{
		return 1.0;
	},
	getSpecVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Jeff Haynie';
	},
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'app:iterator';
	},
	execute: function(id,parameterMap,data,scope)
	{
		var compiled = parameterMap['compiled'];
		var propertyName = parameterMap['property'];
		var items = parameterMap['items'];
		
		var table = parameterMap['table'];
		var width = parameterMap['width'];
		var headers = parameterMap['headers'];
		var selectable = parameterMap['selectable'];
		var array = null;
		
		if (!compiled)
		{
			compiled = eval(parameterMap['template'] + '; init_'+id);
			parameterMap['compiled'] = compiled;
		}
		
		if (items) {
			data = items.evalJSON() || [];
		}
		
		if (propertyName)
		{
			array = Object.getNestedProperty(data,propertyName) || [];
		}
		else
		{
			array = data;
		}
		
		var html = '';
		
		if (!array)
		{
			html = compiled(data);
		}
		else
		{
			if (table)
			{				
				html+='<table width="'+width+'" cellspacing="'+parameterMap['cellspacing']+'"><tr>';
				headers.each(function(h)
				{
					html+='<th>'+h+'</th>';
				});
				html+='</tr>';
			}
			for (var c = 0, len = array.length; c < len; c++)
			{
				var o = array[c];
				if(typeof o != "object")
				{
					o = {'iterator_value': o};
				}
				o['iterator_index']=c;
				o['iterator_length']=len;
				o['iterator_odd_even']=(c%2==0)?'even':'odd';
				if (table)
				{
					if (o['iterator_odd_even'] == 'odd')
						html+='<tr class="'+parameterMap['rowOddClassName']+'">';
					else
						html+='<tr class="'+parameterMap['rowEvenClassName']+'">';
				}
				/* escape out the "'" so that works in IE */
				for (idx in o)
				{
					if (typeof o[idx] == 'string')
					{
						o[idx] = o[idx].replace(/'/,'\u2019');
					}
				}
				html += compiled(o);
				if (table)
				{
					html+='</tr>';
				}
			}
			if (table)
			{
				html+='</table>';
			}
		}
		var element = $(id);
		if (selectable)
		{
			element.setAttribute('selectable',selectable);
		}
		element.innerHTML = html;
		Appcelerator.Compiler.dynamicCompile(element);
	},
	getAttributes: function()
	{
		return [{name: 'on', optional: true, description: "Used to execute the iterator"},
				{name: 'property', optional: true},
				{name: 'items', optional: true},
				
				{name: 'rowEvenClassName', optional: true},
                {name: 'rowOddClassName', optional: true},
				{name: 'table', optional: true, defaultValue: 'false'},
				{name: 'width', optional: true, defaultValue: '100%'},
				{name: 'headers', optional: true, defaultValue: ','},
				{name: 'cellspacing', optional: true, defaultValue: '0'},
				{name: 'selectable', optional: true}];
	},
	compileWidget: function(params) {
		// no message payload to pass for data,
		// maybe we should plumb the triggering message of a dynamic compile through?
        this.execute(params['id'], params, null, '');
	},
	buildWidget: function(element, parameters)
	{
		parameters['template'] = Appcelerator.Compiler.compileTemplate(Appcelerator.Compiler.getHtml(element),true,'init_'+element.id);
		parameters['table'] = parameters['table'] == 'true';
		if (parameters['table'])
		{
			parameters['headers'] = parameters['headers'].split(',');
		}
		
		var compile = !!(!parameters['on'] && parameters['items']);
		
		return {
			'presentation' : '',
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'functions' : ['execute'],
			'wire' : true,
			'compile' : compile
		};
	}
};


Appcelerator.Core.registerModule('app:iterator',Appcelerator.Module.Iterator);