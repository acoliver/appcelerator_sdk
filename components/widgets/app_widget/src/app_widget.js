
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
        return 'http://appcelerator.org';
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
