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


Appcelerator.Widget.ComboBox =
{
	getName: function()
	{
		return 'appcelerator combobox';
	},
	getDescription: function()
	{
		return 'combobox widget';
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
		return 'app:combobox';
	},
	getActions: function()
	{
		return ['enable', 'disable','execute'];
	},	
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [
			{name: 'on', optional: true, type: T.onExpr},
			{name: 'property', optional: true, defaultValue: 'rows',
			 description: 'The property to use in the data array when setting data using the execute action',
			 type: T.identifier},
			{name: 'label', optional: true, defaultValue: 'label',
			 description: 'The property to use in each item of the array to get the label to use for the item',
			 type: T.identifier},
			{name: 'value', optional: true, defaultValue: 'value',
			 description: 'The property to use in each item of the array to get the value to use for the item',
			 type: T.identifier},
			{name: 'onchange', optional: true,
			 description: 'The message to fire when an item is selected',
			 type: T.messageSend}
		];
	},
	compileWidget: function(parameters)
	{
		var p = $(parameters['id']);
		p.comboBox = new SkinnableComboBox(p,p.down('select'),function(name,value,idx)
		{
			(function()
			{
				p.value = value || name;
				p.selectedIndex = idx;
				p.label = name;

				var onchange = parameters['onchange'];
				if (onchange)
				{
					$MQ(onchange,{'id':p.id,'value':value,'label':name,'idx':idx},parameters['scope']);
				}
			}).defer();
		},null,'grey');
	},
	enable: function(id,parameters,data,scope,version)
	{
		var element = $(id);
		element.comboBox.disabled = false;
		element.setOpacity(1.0);
	},
	disable: function(id,parameters,data,scope,version)
	{
		var element = $(id);
		element.comboBox.disabled = true;
		element.setOpacity(0.5);
	},
	execute: function(id,parameterMap,data,scope,version)
	{
		/**
		 * we've received a message to dynamically set the combox box from a message
		 */
		var combobox = $(id).comboBox;
		var rows = Object.getNestedProperty(data,parameterMap['property']);
		if (rows)
		{
			var labelProp = parameterMap['label'];
			var valueProp = parameterMap['value'];
			var data = [];
			for (var c=0;c<rows.length;c++)
			{
				var item = rows[c];
				var label = Object.getNestedProperty(item,labelProp);
				var value = Object.getNestedProperty(item,valueProp) || label;
				data.push({'value':value,'label':label});
			}
			combobox.setOptions(data,true);
		}
		else
		{
			combobox.setOptions([],true);
		}
	},
	buildWidget: function(element,parameters)
	{
		if (Appcelerator.Browser.isIE)
		{
			// NOTE: in IE, you have to append with namespace
			var newhtml = element.innerHTML;
			newhtml = newhtml.replace(/<ITEM/g,'<APP:ITEM').replace(/\/ITEM>/g,'/APP:ITEM>');
			element.innerHTML = newhtml;
		}
		
		parameters['scope'] = element.scope;
		
		var html = '<select id="'+element.id+'_combobox" style="display:none">';

		// if we have static elements, populate them
		if (element.childNodes.length > 0)
		{
			for (var c=0;c<element.childNodes.length;c++)
			{
				var node = element.childNodes[c];
				if (node.nodeType == 1)
				{
					var value = node.getAttribute('value');
					var label = node.innerHTML.strip();
					html+='<option value="'+value+'">'+label+'</option>';
				}
			}
		}
		else
		{
			html+='<option></option>';
		}

		html+='</select>';
				
		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'compile' : true,
			'wire' : false
		};
	}
};

Appcelerator.Core.loadModuleCSS('app:combobox','combobox.css');
Appcelerator.Widget.registerWithJS("app:combobox",Appcelerator.Widget.ComboBox,["combobox.js"]);
