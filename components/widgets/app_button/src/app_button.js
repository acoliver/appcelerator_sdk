
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */



Appcelerator.Widget.Button =
{
	getName: function()
	{
		return 'appcelerator button';
	},
	getDescription: function()
	{
		return 'button widget';
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
		return 'Hamed Hashemi';
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
		return 'app:button';
	},
	getActions: function()
	{
		return ['enable', 'disable'];
	},	
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'on', optional: true, type: T.onExpr},
				{name: 'width', optional: true, defaultValue: 200, type: T.cssDimension},
				{name: 'disabled', optional: true, defaultValue: 'false', type: T.bool},
				{name: 'corner', optional: true, defaultValue: 'round', type: T.enumeration('round','square')},
				{name: 'color', optional: true, defaultValue: 'dark', type: T.enumeration('dark','light')},
				{name: 'icon', optional: true, defaultValue: '', type: T.enumeration('add','delete','edit','save','')},
				{name: 'fieldset', optional: true, type: T.fieldset},
				{name: 'activators', optional: true}];
	},
	dontParseOnAttributes: function()
	{
		return true;
	},
	ignoreFieldset: function()
	{
	    return true;
	},
	//Helper function to check if the button is disabled.  Firefox, Safari and IE do different
	//things
	isEnabled: function(params)
	{
		return !(params['disabled'] == "true" || params['disabled'] == true);
	},
	compileWidget: function(parameters)
	{
		var id = parameters['id'];
		var button = $(id);
		var left = $(id+'_left');
		var middle = $(id+'_middle');
		var right = $(id+'_right');
		var corner = parameters['corner'];
		var color = parameters['color'];
		var disabled = '';
		if (parameters['disabled'] == 'true')
		{
			$(id).disabled = true;
			disabled = '_disabled';
		}
		
		button.onmouseover = function()
		{
			if(Appcelerator.Widget.Button.isEnabled(parameters))
			{
				left.className = 'button_'+color+'_'+corner+'_left_over';
				middle.className = 'button_'+color+'_'+corner+'_middle_over button_'+color+'_text';
				right.className = 'button_'+color+'_'+corner+'_right_over';
			}
		};
		
		button.onmouseout = function()
		{
			if (Appcelerator.Widget.Button.isEnabled(parameters))
			{
				left.className = 'button_'+color+'_'+corner+'_left';
				middle.className = 'button_'+color+'_'+corner+'_middle button_'+color+'_text';
				right.className = 'button_'+color+'_'+corner+'_right';
			}
		};
		
		button.onmousedown = function()
		{
			if (Appcelerator.Widget.Button.isEnabled(parameters))
			{
				left.className = 'button_'+color+'_'+corner+'_left_press';
				middle.className = 'button_'+color+'_'+corner+'_middle_press button_'+color+'_text';
				right.className = 'button_'+color+'_'+corner+'_right_press';
			}
		};		

		button.onmouseup = function()
		{
			if (Appcelerator.Widget.Button.isEnabled(parameters))
			{
				left.className = 'button_'+color+'_'+corner+'_left_over';
				middle.className = 'button_'+color+'_'+corner+'_middle_over button_'+color+'_text';
				right.className = 'button_'+color+'_'+corner+'_right_over';
			}
		};		

		if (parameters['activators'])
		{
			button.onActivatorsDisable = function()
			{
				Appcelerator.Widget.Button.disable(id, parameters);
			};
			button.onActivatorsEnable = function()
			{
				Appcelerator.Widget.Button.enable(id, parameters);
			};
		}
	},
	enable: function(id,parameters,data,scope,version)
	{
		var id = parameters['id'];
		var button = $(id);
		var color = parameters['color'];
		var corner = parameters['corner'];
		var left = $(id+'_left');
		var middle = $(id+'_middle');
		var right = $(id+'_right');

		button.disabled = false;
		left.className = 'button_'+color+'_'+corner+'_left';
		middle.className = 'button_'+color+'_'+corner+'_middle button_'+color+'_text';
		right.className = 'button_'+color+'_'+corner+'_right';
		button.className = 'button_widget';
		$(id).parentNode.disabled = false;	
	},
	disable: function(id,parameters,data,scope,version)
	{
		var id = parameters['id'];
		var button = $(id);
		var corner = parameters['corner'];
		var color = parameters['color'];
		var left = $(id+'_left');
		var middle = $(id+'_middle');
		var right = $(id+'_right');

		button.disabled = true;
		left.className = 'button_'+color+'_'+corner+'_left_disabled';
		middle.className = 'button_'+color+'_'+corner+'_middle_disabled button_'+color+'_text_disabled';
		right.className = 'button_'+color+'_'+corner+'_right_disabled';
		button.className = 'button_widget_disabled';
		$(id).parentNode.disabled = true;
	},
	buildWidget: function(element,parameters)
	{
		var elementText = Appcelerator.Compiler.getHtml(element);
		var corner = parameters['corner'];
		var color = parameters['color'];
		var icon = parameters['icon'];
		if (parameters['icon'] != '')
		{
			icon = 'button_icon_' + parameters['icon'];
		}
		
		var disabled = '';
		if (!Appcelerator.Widget.Button.isEnabled(parameters))
		{
			disabled = '_disabled';
		}
		
		var html = '<button class="button_widget'+disabled+'" id="'+element.id+'" style="width:'+parameters['width']+'px"';
        if(typeof parameters['on'] != 'undefined') 
        {
            html += ' on="'+parameters['on']+'"';
        } 
       	if (parameters['fieldset'])
		{
			html += ' fieldset="'+parameters['fieldset']+'"';
		}
		if (parameters['activators'])
		{
			html += ' activators="'+parameters['activators']+'"';
		}
		if('' != disabled)
		{
			html += ' disabled="true"';
		}
        html += '>';
        
		html += '<table class="button_table" border="0" cellpadding="0" cellspacing="0" width="100%">';
		html += '<tr>';
		html += '<td class="button_'+color+'_'+corner+'_left'+disabled+'" id="'+element.id+'_left">';
		html += '</td>';
		html += '<td class="button_'+color+'_'+corner+'_middle'+disabled+' button_'+color+'_text'+disabled+'" id="'+element.id+'_middle" align="middle">';
		html += '<div align="center"><table cellpadding="0" cellspacing="0" border="0"><tr><td><div'; 
        if(icon != '')
        {
            html += ' style="margin-right: 10px"';
        }
        html += '>'+elementText+'</div></td>';
		html += '<td class="'+icon+'"></td></tr></table></div></td>';
		html += '<td class="button_'+color+'_'+corner+'_right'+disabled+'" id="'+element.id+'_right">';
		html += '</td>';
		html += '</tr>';
		html += '</table>';
		html += '</button>';

		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'compile' : true,
			'wire' : true
		};
	}
};

Appcelerator.Core.loadModuleCSS('app:button','button.css');
Appcelerator.Widget.register('app:button',Appcelerator.Widget.Button);
