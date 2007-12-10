Appcelerator.Module.Panel =
{  
    modulePath:null,
    
    setPath: function(p)
    {
        this.modulePath = p;   
    },
	getName: function()
	{
		return 'appcelerator panel';
	},
	getDescription: function()
	{
		return 'script panel';
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
		return 'Tejus Parikh';
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
		return 'app:panel';
	},
	getAttributes: function()
	{
        return [{name: 'header_text', optional: true, description: 'The text that should be displayed in the header'},
            {name: 'color', optional: true, description: 'The color scheme of the widget.  Supported schemes: light_gray, dark_gray'},
            {name: 'rounded', optional: true, description: 'Set to true for rounded corners'}];
	},
	compileWidget: function(params)
	{
		// window.eval(params['code']);
	},
	buildWidget: function(element,parameters)
	{
        var panelStyle = 'AP_DGRP';
        var headerText = parameters['header_text'];
        var hideHeader = "without_header";
        if(typeof headerText != 'undefined')
        {
            hideHeader = "";
        }
        
        var color = 'light_gray';
        if(parameters['color'])
        {
            color = parameters['color'];
        }
        
        var rounded = parameters['rounded'] == 'true';
        if('dark_gray' == color)
        {      
            panelStyle = (rounded) ? 'AP_DGRP' : 'AP_DGSP';
        }
        else if('light_gray' == color)
        {
           panelStyle = (rounded) ? 'AP_LGRP' : 'AP_LGSP';
        }
        
        var text = Appcelerator.Compiler.getHtml(element);
       
       
        var html = [];
		html.push('<div class="app_panel ' + panelStyle + '" id="' + element.id + '">');
        html.push('<table class="app_panel ' + hideHeader + '">');
        html.push('<tr class="top_row">');
        html.push('<td class="panel_tl left_column"></td>');
        html.push('<td class="panel_tc"></td>');
        html.push('<td class="panel_tr right_column"></td>');
        html.push('</tr>');
        html.push('<tr class="header_row ' + hideHeader + '">');
        html.push('<td class="panel_hl left_column"></td>');
        html.push('<td class="panel_hc"><h3>' + headerText + '</h3></td>');
        html.push('<td class="panel_hr right_column"></td>');
        html.push('</tr>');
        html.push('<tr class="content_row">');
        html.push('<td class="panel_cl left_column"></td>');
        html.push('<td class="panel_cc">' + text + '</td>');
        html.push('<td class="panel_cr right_column"></td>');
        html.push('</tr>');
        html.push('<tr class="bottom_row">');
        html.push('<td class="panel_gl left_column"></td>');
        html.push('<td class="panel_gc"></td>');
        html.push('<td class="panel_gr right_column"></td>');
        html.push('</tr>');
        html.push('</table>');
        html.push('</div>');
        
		
		return {
            'presentation': html.join(' '),
			'position' : Appcelerator.Compiler.POSITION_REPLACE
		};
	}
};

Appcelerator.Core.registerModule('app:panel',Appcelerator.Module.Panel);
Appcelerator.Core.loadModuleCSS('app:panel','panel.css');