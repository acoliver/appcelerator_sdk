
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
						o[idx] = o[idx].replace(/'/,"`");
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
	buildWidget: function(element)
	{
		var parameters = {};
		
		parameters['rowEvenClassName'] = element.getAttribute('rowEvenClassName');
		parameters['rowOddClassName'] = element.getAttribute('rowOddClassName');
		parameters['template'] = Appcelerator.Compiler.compileTemplate(Appcelerator.Compiler.getHtml(element),true,'init_'+element.id);
		parameters['property'] = element.getAttribute('property');
		parameters['table'] = element.getAttribute('table') == 'true';
		if (parameters['table'])
		{
			parameters['width'] = element.getAttribute('width') || '100%';
			parameters['headers'] = (element.getAttribute('headers') || '').split(',');
			parameters['cellspacing'] = element.getAttribute('cellspacing') || '0';
			
		}
		parameters['selectable'] = element.getAttribute('selectable');
		
		Appcelerator.Compiler.parseOnAttribute(element);
		
		return {
			'presentation' : '',
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'cleanup' : null,
			'parameters': parameters,
			'functions' : ['execute']
		};
	}
};


Appcelerator.Core.registerModule('app:iterator',Appcelerator.Module.Iterator);