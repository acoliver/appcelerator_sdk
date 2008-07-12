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
