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
