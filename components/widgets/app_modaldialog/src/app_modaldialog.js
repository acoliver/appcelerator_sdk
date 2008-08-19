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


Appcelerator.Widget.Modaldialog =
{
	getName: function()
	{
		return 'appcelerator modaldialog';
	},
	getDescription: function()
	{
		return 'modaldialog widget';
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
		return 'app:modaldialog';
	},
	getActions: function()
	{
		return ['execute'];
	},	
    getAttributes: function()
    {
        var T = Appcelerator.Types;
        return [{
            name: 'on',
            optional: false,
            type: T.onExpr,
            description: "Used to show the modal dialog"
        }, {
            name: 'property',
            optional: true,
            type: T.identifier,
			description: 'Property of triggering message to use as namespace when'+
	         ' template-replacing body on exxecute'
        }, {
            name: 'top',
            optional: true,
            type: T.number,
			description: 'Something related to distance from the top of the page'
        }];
    },  

	execute: function(id,parameterMap,data,scope)
	{
		var compiled = parameterMap['compiled'];
		var propertyName = parameterMap['property'];
		var array = null;
		
		if (!compiled)
		{
			compiled = eval(parameterMap['template'] + '; init_'+id);
			parameterMap['compiled'] = compiled;
		}
		
		if (propertyName)
		{ 
			array = Object.getNestedProperty(data,propertyName) || [];
		}
		
		var html = '';
		if (!array || array.length == 0)
		{
			html = compiled(data);
		}
		else
		{
			html = compiled(array[0]);
		}
		
		html = '<div scope="' + (scope || element.scope) + '">' + html + '</div>';
		
		var overlay = $('overlay');
		var overlaydata = $('overlay_data');

        Appcelerator.Compiler.destroyContent(overlaydata);
		overlaydata.innerHTML = html;

		Appcelerator.Compiler.dynamicCompile(overlaydata);
		
		var arrayPageSize = Element.getDocumentSize();
		overlay.style.height = arrayPageSize[3] + 250 + 'px';
		Element.show(overlay);

		var dataTop = 0;
		if (!parameterMap['top'])
		{
			var arrayPageScroll = Element.getPageScroll();
			var dataTop = Math.min(80,arrayPageScroll + (arrayPageSize[3] / 5));
			$D('modaldialog: dataTop='+dataTop+',arrayPageScroll='+arrayPageScroll+',arrayPageSize[3]='+arrayPageSize[3]);
		}
		else
		{
			dataTop = parseInt(parameterMap['top']);
		}
		overlaydata.style.top = dataTop + 'px';
		Element.show(overlaydata);
	},
	buildWidget: function(element,parameters,state)
	{
		var hidemessage = 'l:appcelerator.modaldialog.hide';

		var overlay = $('overlay');
		if (!overlay)
		{
			var overlayHtml = '<div id="overlay" style="display: none" on="' + hidemessage + ' then hide" scope="*"></div>';
			new Insertion.Bottom(document.body, overlayHtml);
			overlay = $('overlay');
			overlay.modaldialog_compiled = 1;
			Appcelerator.Compiler.compileElement(overlay,state);
		}
		else
		{
			// allow overlay to be added in the doc but we attach to it
			if (!overlay.modaldialog_compiled)
			{
				overlay.setAttribute('scope','*');
				overlay.setAttribute('on',hidemessage+' then hide');
				Appcelerator.Compiler.compileElement(overlay,state);
				overlay.modaldialog_compiled = 1;
			}
		}
		
		var overlaydata = $('overlay_data');
		if (!overlaydata)
		{
			var overlayDataHtml = '<div on="' + hidemessage + ' then hide" class="overlay_data" id="overlay_data" style="display: none" scope="*"></div>'
			new Insertion.Bottom(document.body, overlayDataHtml);
			overlaydata = $('overlay_data');
			Appcelerator.Compiler.compileElement(overlaydata,state);
		}
		
		parameters['template'] = Appcelerator.Compiler.compileTemplate(Appcelerator.Compiler.getWidgetHTML(element),true,'init_'+element.id);
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REMOVE,
			'parameters': parameters,
			'wire':true			
		};
	}
};

Appcelerator.Core.loadModuleCSS('app:modaldialog','modaldialog.css');
Appcelerator.Widget.register('app:modaldialog',Appcelerator.Widget.Modaldialog);
