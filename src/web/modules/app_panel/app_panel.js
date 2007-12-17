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
    dontParseOnAttributes: function()
    {
        return true;
    },
	getActions: function()
	{
		return ['toggle', 'shade', 'unshade', 'close'];
	},	
	getAttributes: function()
	{
        return [{name: 'header_text', optional: true, description: 'The text that should be displayed in the header.  Setting a value implies a header will be shown'},
            {name: 'color', optional: true, description: 'The color scheme of the widget.  Supported schemes: light_gray, dark_gray'},
            {name: 'rounded', optional: true, description: 'Set to true for rounded corners'},
            {name: 'close', optional: true, description: 'Set to true to display a close button'},
            {name: 'shade', optional: true, description: 'Set to true to enable shade/unshade.  Setting this implies the header will be shown'},
            {name: 'on', optional: true, description: 'Set to enable the widget to listen to events'},
            {name: 'draggable', optional: true, description: 'Set to enable draging'},
            {name: 'resizable', optional: true, description: 'Set to enable the widget to be resized'},
            {name: 'tail', optional: true, description: 'Set to right or left to show a tail under the box (speech bubble)'},
            {name: 'width', optional: true, description: 'Width of the dialog box'},
            {name: 'height', optional: true, description: 'Height for the dialog box'},
            {name: 'userClass', optional: true, description: 'Additional classes for the dialog'}
        ];
	},
    toggle: function(id,parameters,data,scope,version) 
    {
        if($(id).hasClassName("shade"))
        {
            unshade(id);    
        }
        else
        {
            shade(id);
        }
    },
    close: function(id,parameters,data,scope,version)
    {
        $(id).style.display = "none";
        $MQ('l:' + id + '.closed');
    },
    shade: function(id,parameters,data,scope,version)
    {
        var shadeButton = $(id + "_shade");
        if(shadeButton)
        {
            shadeButton.style.display = 'none';
            $(id + '_unshade').style.display = 'block';
            $(id).firstDescendant().addClassName("shade");
            $MQ('l:' + id + '.shaded');
            if(Appcelerator.Browser.isIE)
            {
                var header = $(id).getElementsByClassName('panel_hc')[0];
                header.style.width = $(id).getWidth() - 8 + 'px';
            }
        }
    },
    unshade: function(id,parameters,data,scope,version)
    {
        var shadeButton = $(id + "_shade");
        if (shadeButton) 
        {
            $(id + '_unshade').style.display = 'none';
            $(id + '_shade').style.display = 'block';
            $(id).firstDescendant().removeClassName("shade");
            $MQ('l:' + id + '.unshaded');
        }
    },
	compileWidget: function(params)
	{
        var id = params['id'];
        var shadeButton = $(id + "_shade"); 
        var unshadeButton = $(id + "_unshade"); 
        var closeButton = $(id + "_close"); 
        
        if(typeof params['height'] != "undefined")
        {
            $(id ).style.height = params['height'];   
        }
        
        if(typeof params['width'] != "undefined")
        {
            $(id).style.width = params['width'];
        }
        
        if(null != closeButton) 
        {
            Event.observe(closeButton, "mouseover", function() {closeButton.className = 'app_panel_button close_button_hover'; });
            Event.observe(closeButton, "mouseout", function() { closeButton.className = 'app_panel_button close_button'; });
            Event.observe(closeButton, "mousedown", function() { closeButton.className = 'app_panel_button close_button_onclick'; });
            Event.observe(closeButton, "mouseup", function() { closeButton.className = 'app_panel_button close_button'; });
            Event.observe(closeButton, "click", function(event) { Appcelerator.Module.Panel.close(id)});
        }
        
        if(null != shadeButton) 
        {
            Event.observe(shadeButton, "mouseover", function() {shadeButton.className = 'app_panel_button shade_button_hover'; });
            Event.observe(shadeButton, "mouseout", function() { shadeButton.className = 'app_panel_button shade_button'; });
            Event.observe(shadeButton, "mousedown", function() { shadeButton.className = 'app_panel_button shade_button_onclick'; });
            Event.observe(shadeButton, "mouseup", function() { shadeButton.className = 'app_panel_button shade_button'; });
            Event.observe(shadeButton, "click", function(event){ Appcelerator.Module.Panel.shade(id)});
        }
        
        
        if(null != unshadeButton) 
        {
            Event.observe(unshadeButton, "mouseover", function() {unshadeButton.className = 'app_panel_button unshade_button_hover'; });
            Event.observe(unshadeButton, "mouseout", function() { unshadeButton.className = 'app_panel_button unshade_button'; });
            Event.observe(unshadeButton, "mousedown", function() { unshadeButton.className = 'app_panel_button unshade_button_onclick'; });
            Event.observe(unshadeButton, "mouseup", function() { unshadeButton.className = 'app_panel_button unshade_button'; });
            Event.observe(unshadeButton, "click", function(event){ Appcelerator.Module.Panel.unshade(id)});
        }
        
	},
	buildWidget: function(element,parameters)
	{
        var panelStyle = 'AP_DGRP';
        var headerText = parameters['header_text'];
        var shadeButton = parameters['shade'] == 'true';
        var collapsed = "collapsed";
        var closeButton = parameters['close'] == 'true';
        var tail = parameters['tail'];
        
        if(typeof headerText != 'undefined' || shadeButton)
        {
            collapsed = "";
        }
        
        if(typeof headerText == 'undefined')
        {
            headerText = "";
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
        
        var extraPadding = "";
        if(closeButton && collapsed == 'collapsed')
        {
            extraPadding = "extra_padding";
        }
        var text = Appcelerator.Compiler.getHtml(element);
       
        /* build the main div declaration */
        var divTop = [];
        var html = [];
        var userClassName = "";
        
        if(typeof parameters['userClass'] != 'undefined')
        {
            userClassName = parameters['userClass'];
        }
        divTop.push('<div class="app_panel ' + panelStyle + ' ' + userClassName + '" id="' + element.id + '"');
        
        if(typeof parameters['on'] != 'undefined')
        {
            divTop.push(' on="' + parameters['on'] + '"'); 
        }
        if(typeof parameters['draggable'] != 'undefined')
        {
            divTop.push(' draggable="' + parameters['draggable'] + '"'); 
        }
        
        if(typeof parameters['resizable'] != 'undefined')
        {
            divTop.push(' resizable="' + parameters['resizable'] + '"'); 
        }
        
        divTop.push('>');
        
        var html = [];
        
		html.push(divTop.join(' '));
        html.push('<div class="app_panel_container ' + collapsed + '">');
        
        html.push('<div class="panel_header_container"> <div class="panel_hl"> </div> <div class="panel_hr"> </div>');
        html.push('<div class="panel_hc">');
        if(closeButton || shadeButton)
        {
            html.push("<div class='button_panel'>");
            if(shadeButton)
            {
                html.push('<div id="' + element.id + '_unshade" class="app_panel_button unshade_button"><span>unshade</span></div>');
                html.push('<div id="' + element.id + '_shade" class="app_panel_button shade_button"><span>shade</span></div>');
            }
            if (closeButton) 
            {
                html.push('<div id="' + element.id + '_close" class="app_panel_button close_button"><span>close</span></div>');
            }
            html.push('</div>');
        }
        html.push('<div class="panel_header">');
        html.push('<h3>' + headerText + '</h3>');
        html.push('</div>');
        html.push('</div> </div>');
        html.push('<div id="' + element.id + '_content" class="ap_body"> ');
        html.push('<div class="panel_content_container" >');
        html.push('<div class="panel_cl"></div>');
        html.push('<div class="panel_cr"></div>');
        html.push('<div class="panel_cc">');
        html.push('<div class="panel_body"  >');
        html.push(text);
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        html.push('<div class="panel_footer_container"> <div class="panel_fl"> </div> <div class="panel_fr"> </div> <div class="panel_fc"> </div>');
        if (typeof tail != 'undefined') {
            html.push('<div class="panel_tail">');
            html.push('<div class="tail_' + tail + '">');
            html.push('</div>');
            html.push('</div>');
        }
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        Logger.info(html.join('\n'));
		return {
            'presentation': html.join(' '),
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
            'compile': true,
            'wire': true
		};
	}
};

Appcelerator.Core.registerModule('app:panel',Appcelerator.Module.Panel);
Appcelerator.Core.loadModuleCSS('app:panel','panel.css');