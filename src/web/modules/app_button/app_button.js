
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
		return 'app:button';
	},
	getAttributes: function()
	{
		return [{name: 'width', optional: true, defaultValue: 200},
				{name: 'disabled', optional: true, defaultValue: 'true'},
				{name: 'rounded', optional: true, defaultValue: true},
				{name: 'color', optional: true, defaultValue: 'dark'}];
	},
	compileWidget: function(parameters)
	{
		var id = parameters['id'];
		var button = $(id);
		var left = $(id+'_left');
		var middle = $(id+'_middle');
		var right = $(id+'_right');
		var color = parameters['color'];
		var disabled = '';
		if (parameters['disabled'] == 'true')
		{
			disabled = '_disabled';
		}
		
		button.onmouseover = function()
		{
			if (parameters['disabled'] != 'true')
			{
				left.className = 'button_'+color+'_round_left_over';
				middle.className = 'button_'+color+'_round_middle_over button_table_text';
				right.className = 'button_'+color+'_round_right_over';
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
				left.className = 'button_'+color+'_round_left';
				middle.className = 'button_'+color+'_round_middle button_table_text';
				right.className = 'button_'+color+'_round_right';
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
				left.className = 'button_'+color+'_round_left_press';
				middle.className = 'button_'+color+'_round_middle_press button_table_text';
				right.className = 'button_'+color+'_round_right_press';
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
				left.className = 'button_'+color+'_round_left_over';
				middle.className = 'button_'+color+'_round_middle_over button_table_text';
				right.className = 'button_'+color+'_round_right_over';
				if (Appcelerator.Browser.isIE6)
				{
					Appcelerator.Browser.fixBackgroundPNG(left);
					Appcelerator.Browser.fixBackgroundPNG(middle);
					Appcelerator.Browser.fixBackgroundPNG(right);
				}
			}
		};		

	},
	enable: function(id,parameters,data,scope,version)
	{
		var id = parameters['id'];
		var button = $(id);
		var color = parameters['color'];
		var left = $(id+'_left');
		var middle = $(id+'_middle');
		var right = $(id+'_right');

		parameters['disabled'] = '';
		left.className = 'button_'+color+'_round_left';
		middle.className = 'button_'+color+'_round_middle button_table_text';
		right.className = 'button_'+color+'_round_right';
		button.className = 'button_widget';
		if (Appcelerator.Browser.isIE6)
		{
			Appcelerator.Browser.fixBackgroundPNG(left);
			Appcelerator.Browser.fixBackgroundPNG(middle);
			Appcelerator.Browser.fixBackgroundPNG(right);
		}
	},
	disable: function(id,parameters,data,scope,version)
	{
		var id = parameters['id'];
		var button = $(id);
		var color = parameters['color'];
		var left = $(id+'_left');
		var middle = $(id+'_middle');
		var right = $(id+'_right');

		parameters['disabled'] = 'true';
		left.className = 'button_'+color+'_round_left_disabled';
		middle.className = 'button_'+color+'_round_middle_disabled button_table_text_disabled';
		right.className = 'button_'+color+'_round_right_disabled';
		button.className = 'button_widget_disabled';
		if (Appcelerator.Browser.isIE6)
		{
			Appcelerator.Browser.fixBackgroundPNG(left);
			Appcelerator.Browser.fixBackgroundPNG(middle);
			Appcelerator.Browser.fixBackgroundPNG(right);
		}		
	},
	buildWidget: function(element,parameters)
	{
		var elementText = Appcelerator.Compiler.getHtml(element);
		var color = parameters['color'];
		var disabled = '';
		if (parameters['disabled'] == 'true')
		{
			disabled = '_disabled';
		}
		
		var html = '<button class="button_widget'+disabled+'" id="'+element.id+'" style="width:'+parameters['width']+'px">';
		html += '<table class="button_table" border="0" cellpadding="0" cellspacing="0" width="100%">';
		html += '<tr>';
		html += '<td class="button_'+color+'_round_left'+disabled+'" id="'+element.id+'_left">';
		html += '</td>';
		html += '<td class="button_'+color+'_round_middle'+disabled+' button_table_text'+disabled+'" id="'+element.id+'_middle">';
		html += elementText;
		html += '</td>';
		html += '<td class="button_'+color+'_round_right'+disabled+'" id="'+element.id+'_right">';
		html += '</td>';
		html += '</tr>';
		html += '</table>';
		html += '</button>';

		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'functions' : ['enable', 'disable'],
			'compile' : true
		};
	}
};

Appcelerator.Core.loadModuleCSS('app:button','button.css');
Appcelerator.Core.registerModule('app:button',Appcelerator.Module.Button);
