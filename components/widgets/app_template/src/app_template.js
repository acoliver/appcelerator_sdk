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


Appcelerator.Widget.Template =
{
	getName: function()
	{
		return 'appcelerator template';
	},
	getDescription: function()
	{
		return 'template widget';
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
		return 'app:template';
	},
	execute: function(id,parameterMap,data,scope)
	{
		Appcelerator.Widget.Template.fetch(id,parameterMap['src'],parameterMap['args']);
	},
	getAttributes: function()
	{
		var T = Appcelerator.Types;        
        return [{
            name: 'src',
            optional: false,
			type: T.pathOrUrl,
            description: "The source for the template file to load."
        }, {
            name: 'args',
            optional: true,
			type: T.json,
            description: "Used to replace text in the template file."
        }];
	},	
	buildWidget: function(element,parameters,state)
	{
		var src = parameters['src'];
		var args = parameters['args'];
		var payload = {};

		element.innerHTML = Appcelerator.Compiler.getHtml(element);		
		if (element.childNodes.length > 0)
		{
			for (var c=0;c<element.childNodes.length;c++)
			{
				var node = element.childNodes[c];
				if (node.nodeType == 1)
				{
					var id = node.getAttribute('id');
					payload[id] = Appcelerator.Compiler.getHtml(node,true);
				}
			}
		}

		Appcelerator.Widget.Template.fetch(element.id,element.scope,src,args,payload,state);

		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : ''
		};
	},
	fetch: function (target,scope,src,args,payload,state)
	{
		state.pending++;
		
		Appcelerator.Util.IFrame.fetch(src,function(doc)
		{
			if (args)
			{
				var html = doc.innerHTML;
				// replace tokens in our HTML with our args
				var t = Appcelerator.Compiler.compileTemplate(html);
				html = t(args.evalJSON());
				doc.innerHTML = html;
			}
			
			for (var token in payload)
			{
				if (typeof token == 'string')
				{
					var item = doc.ownerDocument.getElementById(token);
					if (item)
					{
						item.innerHTML = payload[token];
					}
					else
					{
						Logger.warn('Element with id = '+token+' not found in '+src);
					}
				}
			}
			
			var t = $(target);
			t.setAttribute('scope',scope);
			t.innerHTML = Appcelerator.Compiler.getHtml(doc);
			state.pending--;
			t.state = state;
			Appcelerator.Compiler.compileElement(t,state,true);
			Appcelerator.Compiler.checkLoadState(t);
		});
	}
};

Appcelerator.Widget.register('app:template',Appcelerator.Widget.Template);
