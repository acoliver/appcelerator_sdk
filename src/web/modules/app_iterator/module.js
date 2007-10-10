
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
		
		if (propertyName)
		{
			array = Object.getNestedProperty(data,propertyName) || [];
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
				html+='<table width="'+width+'"><tr>';
				headers.each(function(h)
				{
					html+='<th>'+h+'</th>';
				});
				html+='</tr>';
			}
			for (var c = 0, len = array.length; c < len; c++)
			{
				var o = array[c];
				o['iterator_index']=c;
				o['iterator_length']=len;
				o['iterator_odd_even']=(c%2==0)?'even':'odd';
				if (table)
				{
					html+='<tr>';
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
	buildWidget: function(element)
	{
		var parameters = {};
		
		// FIXME
		//	var rowEvenClassName = element.getAttribute('rowEvenClassName');
		//	var rowOddClassName = element.getAttribute('rowOddClassName');
		
		parameters['template'] = Appcelerator.Compiler.compileTemplate(Appcelerator.Compiler.getHtml(element),true,'init_'+element.id);
		parameters['property'] = element.getAttribute('property');
		parameters['table'] = element.getAttribute('table') == 'true';
		if (parameters['table'])
		{
			parameters['width'] = element.getAttribute('width') || '100%';
			parameters['headers'] = (element.getAttribute('headers') || '').split(',');
		}
		parameters['selectable'] = element.getAttribute('selectable');
		
		return {
			'presentation' : '',
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'initialization':  Appcelerator.Compiler.parseOnAttribute(element),
			'cleanup' : null,
			'parameters': parameters,
			'functions' : ['execute']
		};
	}
};


Appcelerator.Core.registerModule('app:iterator',Appcelerator.Module.Iterator);