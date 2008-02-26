/*
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


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
