
Appcelerator.Module.Button =
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
		return 1.0;
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
		return [{name: 'on', optional: true},
				{name: 'width', optional: true, defaultValue: 200},
				{name: 'disabled', optional: true, defaultValue: 'false'},
				{name: 'corner', optional: true, defaultValue: 'round'},
				{name: 'color', optional: true, defaultValue: 'dark'},
				{name: 'icon', optional: true, defaultValue: ''},
				{name: 'fieldset', optional: true},
				{name: 'activators', optional: true}];
	},
	dontParseOnAttributes: function()
	{
		return true;
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
			if (parameters['disabled'] != 'true')
			{
				left.className = 'button_'+color+'_'+corner+'_left_over';
				middle.className = 'button_'+color+'_'+corner+'_middle_over button_'+color+'_text';
				right.className = 'button_'+color+'_'+corner+'_right_over';
				if (Appcelerator.Browser.isIE6)
				{
					Appcelerator.Browser.fixBackgroundPNG(left);
					Appcelerator.Browser.fixBackgroundPNG(middle);
					Appcelerator.Browser.fixBackgroundPNG(right);
				}
			}
		};
		
		button.onmouseout = function()
		{
			if (parameters['disabled'] != 'true')
			{
				left.className = 'button_'+color+'_'+corner+'_left';
				middle.className = 'button_'+color+'_'+corner+'_middle button_'+color+'_text';
				right.className = 'button_'+color+'_'+corner+'_right';
				if (Appcelerator.Browser.isIE6)
				{
					Appcelerator.Browser.fixBackgroundPNG(left);
					Appcelerator.Browser.fixBackgroundPNG(middle);
					Appcelerator.Browser.fixBackgroundPNG(right);
				}
			}
		};
		
		button.onmousedown = function()
		{
			if (parameters['disabled'] != 'true')
			{
				left.className = 'button_'+color+'_'+corner+'_left_press';
				middle.className = 'button_'+color+'_'+corner+'_middle_press button_'+color+'_text';
				right.className = 'button_'+color+'_'+corner+'_right_press';
				if (Appcelerator.Browser.isIE6)
				{
					Appcelerator.Browser.fixBackgroundPNG(left);
					Appcelerator.Browser.fixBackgroundPNG(middle);
					Appcelerator.Browser.fixBackgroundPNG(right);
				}
			}
		};		

		button.onmouseup = function()
		{
			if (parameters['disabled'] != 'true')
			{
				left.className = 'button_'+color+'_'+corner+'_left_over';
				middle.className = 'button_'+color+'_'+corner+'_middle_over button_'+color+'_text';
				right.className = 'button_'+color+'_'+corner+'_right_over';
				if (Appcelerator.Browser.isIE6)
				{
					Appcelerator.Browser.fixBackgroundPNG(left);
					Appcelerator.Browser.fixBackgroundPNG(middle);
					Appcelerator.Browser.fixBackgroundPNG(right);
				}
			}
		};		

		if (parameters['activators'])
		{
			button.onActivatorsDisable = function()
			{
				Appcelerator.Module.Button.disable(id, parameters);
			};
			button.onActivatorsEnable = function()
			{
				Appcelerator.Module.Button.enable(id, parameters);
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

		parameters['disabled'] = '';
		left.className = 'button_'+color+'_'+corner+'_left';
		middle.className = 'button_'+color+'_'+corner+'_middle button_'+color+'_text';
		right.className = 'button_'+color+'_'+corner+'_right';
		button.className = 'button_widget';
		if (Appcelerator.Browser.isIE6)
		{
			Appcelerator.Browser.fixBackgroundPNG(left);
			Appcelerator.Browser.fixBackgroundPNG(middle);
			Appcelerator.Browser.fixBackgroundPNG(right);
		}
		$(id).disabled = false;		
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

		parameters['disabled'] = 'true';
		left.className = 'button_'+color+'_'+corner+'_left_disabled';
		middle.className = 'button_'+color+'_'+corner+'_middle_disabled button_'+color+'_text_disabled';
		right.className = 'button_'+color+'_'+corner+'_right_disabled';
		button.className = 'button_widget_disabled';
		if (Appcelerator.Browser.isIE6)
		{
			Appcelerator.Browser.fixBackgroundPNG(left);
			Appcelerator.Browser.fixBackgroundPNG(middle);
			Appcelerator.Browser.fixBackgroundPNG(right);
		}
		$(id).disabled = true;
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
		if (parameters['disabled'] == 'true')
		{
			disabled = '_disabled';
		}
		
		var html = '<button class="button_widget'+disabled+'" id="'+element.id+'" style="width:'+parameters['width']+'px" on="'+parameters['on']+'"';
		if (parameters['fieldset'])
		{
			html += ' fieldset="'+parameters['fieldset']+'"';
		}
		if (parameters['activators'])
		{
			html += ' activators="'+parameters['activators']+'"';
		}
		html += '>';
		html += '<table class="button_table" border="0" cellpadding="0" cellspacing="0" width="100%">';
		html += '<tr>';
		html += '<td class="button_'+color+'_'+corner+'_left'+disabled+'" id="'+element.id+'_left">';
		html += '</td>';
		html += '<td class="button_'+color+'_'+corner+'_middle'+disabled+' button_'+color+'_text'+disabled+'" id="'+element.id+'_middle" align="middle">';
		html += '<div align="center"><table cellpadding="0" cellspacing="0" border="0"><tr><td><div style="margin-right: 10px">'+elementText+'</div></td>';
		html += '<td class="'+icon+'"/></td></tr></table></div></td>';
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
Appcelerator.Core.registerModule('app:button',Appcelerator.Module.Button);
