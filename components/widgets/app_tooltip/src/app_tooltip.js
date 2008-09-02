
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



Appcelerator.Widget.Tooltip =
{
    getName: function()
    {
        return 'appcelerator tooltip';
    },
    getDescription: function()
    {
        return 'tooltip widget';
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
        return 'Nolan Wright';
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
        return 'app:tooltip';
    },
    getAttributes: function()
    {
		var T = Appcelerator.Types;        
        return [{
            name: 'element',
            optional: false,
            description: "element for tooltip"
        }, {
            name: 'backgroundColor',
            optional: true,
            defaultValue: '#FC9',
			type: T.color,
            description: "background color of tooltip"
        }, {
            name: 'borderColor',
            optional: true,
            defaultValue: '#c96',
			type: T.color,
            description: "border color of tooltip"
        }, {
            name: 'mouseFollow',
            optional: true,
            defaultValue: false,
			type: T.bool,
            description: "should tip follow mouse"
        }, {
            name: 'opacity',
            optional: true,
            defaultValue: '.75',
			type: T.number,
            description: "tooltip opacity"
        }, {
            name: 'textColor',
            optional: true,
            defaultValue: '#111',
			type: T.color,
            description: "text color of tooltip"
        }];
    },

	compileWidget: function(parameters)
	{
		var mouseFollow = (parameters['mouseFollow']||'true')=="true";
		var tip = new Tooltip($(parameters['element']), 
			{ backgroundColor:parameters['backgroundColor'],
			  borderColor:parameters['borderColor'],
			  textColor:parameters['textColor'],
			  mouseFollow:mouseFollow,
			  opacity:parameters['opacity']
			});
		tip.content = parameters['html'];
	},
    buildWidget: function(element,parameters)
    {
 		parameters['html'] = Appcelerator.Compiler.getHtml(element);
		return {
			'presentation' :'' ,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'wire' : false,
			'compile':true
		};
    }
};

Appcelerator.Core.loadModuleCSS("app:tooltip","tooltips.css");
Appcelerator.Core.requireCommonJS('scriptaculous/builder.js',function()
{
    Appcelerator.Widget.registerWithJS('app:tooltip',Appcelerator.Widget.Tooltip,['tooltips.js']);
});

