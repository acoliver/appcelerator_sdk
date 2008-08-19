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


Appcelerator.Widget.Accordion =
{
	getName: function()
	{
		return 'appcelerator accordion';
	},
	getDescription: function()
	{
		return 'provides horizontal or vertical accordions by implementing http://www.stickmanlabs.com/accordion';
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
		return 'app:accordion';
	},
	getAttributes: function()
	{
	    var T = Appcelerator.Types;
        return [{name: 'on', optional: true, type: T.onExpr,
		         description: 'Used to execute the accordion'},
		         {name: 'mode', optional: true, description: 'Vertical or horizontal alignment', 
		         defaultValue: 'vertical', type: T.enumeration('vertical', 'horizontal')},
                 {name: 'property', optional: true, type: T.identifier},
		         {name: 'toggleClass', optional: true, type: T.cssClass, defaultValue: 'accordion_toggle'},
		         {name: 'toggleActiveClass', optional: true, type: T.cssClass, defaultValue: 'accordion_toggle_active'},
		         {name: 'contentClass', optional: true, type: T.cssClass, defaultValue: 'accordion_content'},
		         {name: 'width', optional: true, type: T.identifier},
		         {name: 'height', optional: true, type: T.identifier},
                 {name: 'onEvent', optional: true, type: T.identifier, defaultValue: 'click', 
                 description: 'The event that activates the accordion'}];
	},
	getActions: function()
	{
		return ['execute'];
	},
	execute: function(id,parameters,data,scope)
	{
	    var compiled = parameters['compiled'];
		var array = null;
		var propertyName = parameters['property'];

		if (!compiled)
		{
    		var compiled = eval(parameters['template'] + '; init_'+id);
    		parameters['compiled'] = compiled;
		}

		if (propertyName)
		{
			array = Object.getNestedProperty(data,propertyName) || [];
		}
		else
		{
			array = data;
		}

		var html = '';
		
		if (array.length != 0 && array[0] == undefined)
		{
			array = [array];
		}
		for (var c = 0, len = array.length; c < len; c++)
		{
			var o = array[c];
			html += compiled(o);
		}
		
		if (parameters['mode'] == 'horizontal')
		{
		    html = '<div class="horizontal_accordion">' + html + '</div>';
		}
		
		var element = $(id);
        Appcelerator.Compiler.destroyContent(element);
		element.innerHTML = Appcelerator.Compiler.addIENameSpace(html);
		Appcelerator.Compiler.dynamicCompile(element);
		
		var options = {classNames: {
	        toggle: parameters['toggleClass'],
	        toggleActive: parameters['toggleActiveClass'],
	        content: parameters['contentClass']
	        }, direction : parameters['mode'],
	        onEvent: parameters['onEvent'],
	        defaultSize : {
                height : parameters['height'],
                width : parameters['width']}
	        };
		
		var myaccordion = new accordion(id, options);
    },
	buildWidget: function(element,parameters)
	{
		parameters['template'] = Appcelerator.Compiler.compileTemplate(Appcelerator.Compiler.getHtml(element),true,'init_'+element.id);

		return {
			'presentation' : '',
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'wire' : false,
			'compile' : false
		};
	}
};

Appcelerator.Core.loadModuleCSS('app:accordion','accordion.css');
Appcelerator.Widget.registerWidgetWithJS('app:accordion',Appcelerator.Widget.Accordion,['accordion.js']);
