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


Appcelerator.Widget.Security =
{
	eventReceived:null,
	getName: function()
	{
		return 'appcelerator security';
	},
	getDescription: function()
	{
		return 'security widget';
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
		return 'Jeff Haynie';
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
		return 'app:security';
	},
	execute: function(id,parameterMap,data,scope,version)
	{
		Appcelerator.Widget.Security.securityCode = parameterMap['code'].toFunction(true);
		Appcelerator.Widget.Security.eventReceived = {data:data,scope:scope,version:version};
		Appcelerator.Widget.Security.executeSecurity();
	},
	getActions: function()
	{
		return ['execute'];
	},	
	getAttributes: function()
	{
        return [{
            name: 'on',
            optional: true,
			type: Appcelerator.Types.onExpr,
            description: "May be used to execute the widget"
        }];
	},
	executeSecurity:function()
	{
		$$('*[security]').each(function(element)
		{
			Appcelerator.Widget.Security.eventReceived.element = element;
			Appcelerator.Widget.Security.eventReceived.roles = Appcelerator.Widget.Security.eventReceived.element.getAttribute('security').split(',');
			var result = Appcelerator.Widget.Security.securityCode.call(Appcelerator.Widget.Security.eventReceived);
			if (result != true)
			{
				element.style.display='none';
				element.setAttribute('_compilerRemoved','true');
			}
		});
		$$('*[_compilerRemoved]').each(function (item)
		{
			Element.remove(item);
		});
	},
	buildWidget: function(element, parameters)
	{
		var code = Appcelerator.Compiler.getHtml(element);
		
		if (code && code.trim().length > 0)
		{
			if (parameters['on'])
			{
				parameters['code'] = String.unescapeXML(code);
				
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'parameters': parameters
				};
			}
			else
			{
				return {
					'position' : Appcelerator.Compiler.POSITION_REMOVE,
					'presentation':'Error: security widget requires on attribute to execute'
				};
			}
		}
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation':'Error: security widget requires code inside tag for implementation'
		};
	}
};


Appcelerator.Widget.register('app:security',Appcelerator.Widget.Security);
