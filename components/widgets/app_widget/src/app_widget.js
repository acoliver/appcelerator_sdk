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


Appcelerator.Widget.Widget =
{
    getName: function()
    {
        return 'appcelerator widget';
    },
    getDescription: function()
    {
        /* Optional parameters that aren't set by the user get set to '' */
        return 'A widget that allows you to define other widgets. It\'s a MetaWidget!';
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
        return 'Mark Luffel';
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
        return 'app:widget';
    },
    getActions: function()
    {
        return [];
    },  
    getAttributes: function()
    {
        var T = Appcelerator.Types;
        return [{
            name: 'name',
            optional: false,
			type: T.pattern(/^[a-zA-Z_]+:[a-zA-Z_]+$/, 'Tag Name'),
            description: 'Full name of the widget.'+
			'Any tag in the current document with this name will be template-replaced with the body of this tag.'
        }, {
            name: 'required_params',
            optional: true,
			type: T.commaSeparated,
            description: 'List of attribute names that must be added to the widget, comma-separated'
        }, {
            name: 'optional_params',
            optional: true,
			type: T.commaSeparated,
            description: 'List of attribute names that may be added to the widget, comma-separated'
        }];
    },
    compileWidget: function(params)
    {
    },
    buildWidget: function(element,parameters)
    {
        var widgetName = parameters['name'];
        var requiredParams = parameters['required_params'];
        var optionalParams = parameters['optional_params'];
        var widgetBody = Appcelerator.Compiler.getHtml(element);
        var widgetTemplate = Appcelerator.Compiler.compileTemplate(widgetBody);
        
        var attributes = [];
        if (requiredParams) {
            requiredParams = requiredParams.split(',');
            for (var i = 0; i < requiredParams.length; i++) {
                var name = requiredParams[i];
                attributes.push({
                    name: name,
                    optional: false,
                    description: name 
                });
            }
        }
        if(optionalParams) {
            optionalParams = optionalParams.split(',');
            for(var i = 0; i < optionalParams.length; i++) {
                var name = optionalParams[i];
                attributes.push({
                    name: name,
                    optional: true,
                    description: name
                });
            }
        } else {
            optionalParams = [];
        }
        
        var widget = {
            isWidget: function() {
                return true;
            },
            getWidgetName: function() {
                return widgetName;
            },
            getActions: function() {
                return [];
            },
            getAttributes: function() {
                return attributes;
            },
            compileWidget: function() {
            },
            buildWidget: function(element,parameters) {
                // ignoring element body, maybe want a jsp-esque <insertBody/> tag
                for (var i = 0; i < optionalParams.length; i++) {
                    var name = optionalParams[i];
                    if (!parameters[name]) {
                        parameters[name] = '';
                    }
                }
                return {
                    'presentation' : widgetTemplate(parameters),
                    'position' : Appcelerator.Compiler.POSITION_REPLACE,
                    'wire' : true,
                    'compile' : true,
                    'parent_tag' : 'none' 
                }
            }
        };
        
        Appcelerator.Widget.register(widgetName, widget, true);
        return {
            'position' : Appcelerator.Compiler.POSITION_REMOVE
        };
    }
};

Appcelerator.Widget.register('app:widget', Appcelerator.Widget.Widget);
