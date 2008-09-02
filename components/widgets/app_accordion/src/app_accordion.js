
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
