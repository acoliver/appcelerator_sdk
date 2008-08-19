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

Appcelerator.Widget.Panel =
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
        return "__VERSION__";
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
    getConditions: function()
    {
        return ["open", "close", "shade", "unshade"];
    },
    getActions: function()
    {
        return ['toggle', 'shade', 'unshade', 'close', 'open'];
    },    
    getAttributes: function()
    {
        var T = Appcelerator.Types;        
        return [{
            name: 'header_text',
            optional: true,
            description: 'The text that should be displayed in the header. ' +
            'Setting a value implies a header will be shown'
        }, {
            name: 'color',
            defaultValue: 'dark_gray',
            optional: true,
            type: T.enumeration('light_gray', 'dark_gray'),
            description: 'The color scheme of the widget.  Supported schemes: light_gray, dark_gray'
        }, {
            name: 'rounded',
            defaultValue: false,
            optional: true,
            type: T.bool,
            description: 'Set to true for rounded corners'
        }, {
            name: 'close',
            optional: true,
            type: T.bool,
            description: 'Set to true to display a close button'
        }, {
            name: 'shade',
            defaultValue: false,
            optional: true,
            type: T.bool,
            description: 'Set to true to enable shade/unshade. ' +
            'Setting this implies the header will be shown'
        }, {
            name: 'on',
            optional: true,
            type: T.onExpr,
            description: 'Set to enable the widget to listen to events'
        }, {
            name: 'draggable',
            defaultValue: false,
            optional: true,
            type: T.bool,
            description: 'Set to enable draging'
        }, {
            name: 'resizable',
            defaultValue: false,
            optional: true,
            type: T.bool,
            description: 'Set to enable the widget to be resized'
        }, {
            name: 'tail',
            optional: true,
            type: T.enumeration('right', 'left'),
            description: 'Set to right or left to show a tail under the box (speech bubble)'
        }, {
            name: 'width',
            optional: true,
            type: T.cssDimension,
            description: 'Width of the dialog box'
        }, {
            name: 'height',
            optional: true,
            type: T.cssDimension,
            description: 'Height for the dialog box'
        }, {
            name: 'userClass',
            optional: true,
            type: T.cssClass,
            description: 'Additional classes for the dialog'
        }, {
            name: 'style',
            optional: true,
            type: T.cssClass,
            defaultValue: "",
            description: 'in-line styles for the dialog'
        }];
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
    open: function(id,parameters,data,scope,version)
    {
		$(id).open=true;
        $(id).style.display = "block";
        Appcelerator.Compiler.fireCustomCondition(id, 'open', {'id': id});
    },
    close: function(id,parameters,data,scope,version)
    {
		$(id).open=false;
        $(id).style.display = "none";
        Appcelerator.Compiler.fireCustomCondition(id, 'close', {'id': id});
    },
    shade: function(id,parameters,data,scope,version)
    {
        var shadeButton = $(id + "_shade");
        if(shadeButton)
        {
			$(id).shaded=true;
            shadeButton.style.display = 'none';
            $(id + '_unshade').style.display = 'block';
            $(id).firstDescendant().addClassName("shade");
            Appcelerator.Compiler.fireCustomCondition(id, 'shade', {'id': id});
        }
    },
    unshade: function(id,parameters,data,scope,version)
    {
        var shadeButton = $(id + "_shade");
        if (shadeButton) 
        {
			$(id).shaded=false;
            $(id + '_unshade').style.display = 'none';
            $(id + '_shade').style.display = 'block';
            $(id).firstDescendant().removeClassName("shade");        
            Appcelerator.Compiler.fireCustomCondition(id, 'unshade', {'id': id});
        }
    },
    compileWidget: function(params)
    {
        var id = params['id'];
        var shadeButton = $(id + "_shade"); 
        var unshadeButton = $(id + "_unshade"); 
        var closeButton = $(id + "_close"); 
        
        var setDimensions = false;
        if(typeof params['height'] != "undefined")
        {
            $(id).style.height = params['height'];   
            setDimensions = true;
        }
        
        if(typeof params['width'] != "undefined")
        {
            $(id).style.width = params['width'];
            setDimensions = true;
        }
        
        if(typeof params['userClass'] != "undefined")
        {
            setDimensions = true;
        }
        
        
        if(Appcelerator.Browser.isIE6 && !setDimensions)
        {
            $(id+"_content").style.marginRight = "1px";
        }
        
        if(Appcelerator.Browser.isIE7 && setDimensions && typeof params['tail'] != "undefined")
        {
            $(id).style.marginBottom = "50px";
        }
        
        if(null != closeButton) 
        {
            Appcelerator.Widget.Panel.setClassOnEvents(closeButton, {
                mouseover: 'app_panel_button close_button_hover',
                mouseout:  'app_panel_button close_button',
                mousedown: 'app_panel_button close_button_onclick',
                mouseup:   'app_panel_button close_button'
            });
            Event.observe(closeButton, "click", function(event) { Appcelerator.Widget.Panel.close(id)});
        }
        
        if(null != shadeButton) 
        {
            Appcelerator.Widget.Panel.setClassOnEvents(shadeButton, {
                mouseover: 'app_panel_button shade_button_hover',
                mouseout:  'app_panel_button shade_button',
                mousedown: 'app_panel_button shade_button_onclick',
                mouseup:   'app_panel_button shade_button'
            });
            Event.observe(shadeButton, "click", function(event){ Appcelerator.Widget.Panel.shade(id)});
        }
        
        
        if(null != unshadeButton) 
        {
            Appcelerator.Widget.Panel.setClassOnEvents(unshadeButton, {
                mouseover: 'app_panel_button unshade_button_hover',
                mouseout:  'app_panel_button unshade_button',
                mousedown: 'app_panel_button unshade_button_onclick',
                mouseup:   'app_panel_button unshade_button'
            });
            Event.observe(unshadeButton, "click", function(event){ Appcelerator.Widget.Panel.unshade(id)});
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
        divTop.push('<div class="app_panel ' + panelStyle + ' ' + userClassName + '" id="' + element.id + '" style="' + parameters['style'] + '"');
        
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
        html.push('<div class="ap_body"> ');
        html.push('<div id="' + element.id + '_content" class="panel_content_container ' + extraPadding + '">');

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
        return {
            'presentation': html.join(' '),
            'position' : Appcelerator.Compiler.POSITION_REPLACE,
            'compile': true,
            'wire': true
        };
    },
    
    setClassOnEvents: function(element, eventToClassNameMapping)
    {
        $H(eventToClassNameMapping).each(function(eventAndClass)
        {
            var event = eventAndClass[0];
            var className = eventAndClass[1];
            Event.observe(element, event, function() {element.className = className;});
        });
    }
};

Appcelerator.Core.loadModuleCSS('app:panel','panel.css');
if(Appcelerator.Browser.isIE7)
{
    Appcelerator.Core.loadModuleCSS('app:panel','panel_ie7.css');
}
Appcelerator.Widget.register('app:panel',Appcelerator.Widget.Panel);
