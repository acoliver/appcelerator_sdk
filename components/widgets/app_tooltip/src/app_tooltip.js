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

