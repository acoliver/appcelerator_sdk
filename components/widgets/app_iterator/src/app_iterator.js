/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/


Appcelerator.Widget.Iterator =
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
		return '__VERSION__';
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
	getAttributes: function()
    {
		var T = Appcelerator.Types;
        return [{name: 'on', optional: true, type: T.onExpr,
		         description: "Used to execute the iterator"},
                {name: 'items', optional: true, type: T.json,
				 description: "Literal (or template-replaced) JSON array to iterate over"},
                {name: 'property', optional: true, type: T.identifier},
                
                {name: 'rowEvenClassName', optional: true, type: T.cssClass},
                {name: 'rowOddClassName', optional: true, type: T.cssClass},
                {name: 'table', optional: true, defaultValue: 'false', type: T.bool},
                {name: 'width', optional: true, defaultValue: '100%', type: T.cssDimension},
                {name: 'headers', optional: true, defaultValue: ',', type: T.commaSeparated},
                {name: 'cellspacing', optional: true, defaultValue: '0', type: T.cssDimension},
                {name: 'selectable', optional: true, type: T.bool}];
    },

	getActions: function()
	{
		return ['execute'];
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
		
		if (items) 
		{
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
         	// this is in the case we pass in an object instead of 
			// an array, make it an array of length one so we can iterate
			// !Object.isArray(array) fails in some cases so we don't use it (it's poorly implemented)
			if (array.length != 0 && array[0] == undefined)
			{
				array = [array];
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
				for (var idx in o)
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

        Appcelerator.Compiler.destroyContent(element);
		element.innerHTML = Appcelerator.Compiler.addIENameSpace(html);
		Appcelerator.Compiler.dynamicCompile(element);
	},
	compileWidget: function(params) 
	{
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
			'wire' : true,
			'compile' : compile
		};
	}
};


Appcelerator.Widget.register('app:iterator',Appcelerator.Widget.Iterator);
