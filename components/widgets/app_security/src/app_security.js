
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
		return 'http://appcelerator.org';
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
