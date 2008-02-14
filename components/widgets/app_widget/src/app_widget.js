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
        return 1.0;
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
