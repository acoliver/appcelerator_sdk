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


Appcelerator.Widget.Content =
{
	getName: function()
	{
		return 'appcelerator content';
	},
	getDescription: function()
	{
		return 'content widget support modularizing of code by breaking them into separate files which can be loaded either at load time or dynamically based on a message';
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
		return 'app:content';
	},
	getActions: function()
	{
		return ['execute'];
	},	
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'on', optional: true, type: T.onExpr,
		         description: "May be used to execute/load the content."},
				{name: 'src', optional: true, type: T.pathOrUrl,
				 description: "The source for the content file to load."},
				{name: 'args', optional: true, type: T.json,
				 description: "Used to replace text in the content file."},
				{name: 'lazy', optional: true, defaultValue: 'false', type: T.bool,
				 description: "Indicates whether the content file should be lazy loaded."},
				{name: 'reload', optional: true, defaultValue: 'true', type: T.bool,
				 description: "Indicates whether the content file should be refetched and reloaded on every execute. If false, execute will do nothing if already executed."},
				{name: 'onload', optional: true, type: T.messageSend,
				 description: "Fire this message when content file is loaded."},
				{name: 'onfetch', optional: true, type: T.messageSend,
				 description: "Fire this message when content file is fetched but before being loaded."},
 				{name: 'property', optional: true, type: T.messageSend,
 				 description: "The name of the property in the message payload to be used for the src"},
				{name:'useframe', optional: true, defaultValue: 'true', type: T.bool, 
				 description: "Use a hidden iframe when fetching the content, instead of an Ajax request. This is normally not required."}
		];
	},
	execute: function(id,parameterMap,data,scope)
	{
	    if (parameterMap['property'] && data[parameterMap['property']])
	    {
	        parameterMap['src'] = data[parameterMap['property']];
	    }
		if (!parameterMap['reload'])
		{
			if (!$(id).fetched && !parameterMap['fetched'])
			{
				Appcelerator.Widget.Content.fetch(id,parameterMap['src'],parameterMap['args'],parameterMap['onload'],parameterMap['onfetch'],parameterMap['useframe']);
				$(id).fetched = true;
			}
		}
		else
		{
			Appcelerator.Widget.Content.fetch(id,parameterMap['src'],parameterMap['args'],parameterMap['onload'],parameterMap['onfetch'],parameterMap['useframe']);
		}
	},
	compileWidget: function(parameters)
	{
		if (!(parameters['lazy'] == 'true') && parameters['src'])
		{
			Appcelerator.Widget.Content.fetch(parameters['id'],parameters['src'],parameters['args'],parameters['onload'],parameters['onfetch'],parameters['useframe']);
			parameters['fetched'] = true;
		}
	},
	buildWidget: function(element,parameters,state)
	{
		parameters['reload'] = (parameters['reload'] == 'true');
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : '',
			'compile' : true
		};
	},
	fetch: function (target,src,args,onload,onfetch,useframe)
	{
        target = $(target);
        target.style.visibility='hidden';

		if (useframe != 'true')
		{
			new Ajax.Request(src,
			{
				asynchronous:true,
				method:'get',
				onSuccess:function(resp)
				{
					if (onfetch)
					{
						$MQ(onfetch,{'src':src,'args':args});
					}
					var scope = target.getAttribute('scope') || target.scope;
					var state = Appcelerator.Compiler.createCompilerState();
					target.state = state;
					var html = resp.responseText.stripScripts();
					var match = /<body[^>]*>([\s\S]*)?<\/body>/mg.exec(html);
					if (match)
					{
						html = match[1];
					}
					html = Appcelerator.Compiler.addIENameSpace('<div>'+html+'</div>');
					if (args)
					{
						// replace tokens in our HTML with our args
						var t = Appcelerator.Compiler.compileTemplate(html);
						html = t(args.evalJSON());
					}
					// turn off until we're done compiling
					target.innerHTML = html;
					state.onafterfinish=function()
					{
						 // turn it back on once we're done compiling
					     target.style.visibility='visible';
			             if (onload)
			             {
			                $MQ(onload,{'src':src,'args':args});
			             }
					};
					// evaluate scripts
					resp.responseText.evalScripts();
					Appcelerator.Compiler.compileElement(target.firstChild,state);
					state.scanned=true;
					Appcelerator.Compiler.checkLoadState(target);
				}
			});
		}
		else
		{
			Appcelerator.Util.IFrame.fetch(src,function(doc)
			{
				if (onfetch)
				{
					$MQ(onfetch,{'src':src,'args':args});
				}

				var scope = target.getAttribute('scope') || target.scope;
				doc.setAttribute('scope',scope);
				doc.scope = scope;
				Appcelerator.Compiler.getAndEnsureId(doc);
				var contentHTML = doc.innerHTML;
				var state = Appcelerator.Compiler.createCompilerState();
				target.state = state;
				var html = '<div>'+contentHTML.stripScripts()+'</div>';
				if (args)
				{
					// replace tokens in our HTML with our args
					var t = Appcelerator.Compiler.compileTemplate(html);
					html = t(args.evalJSON());
				}
				// turn off until we're done compiling
				target.innerHTML = html;
				state.onafterfinish=function()
				{
					 // turn it back on once we're done compiling
				     target.style.visibility='visible';
		             if (onload)
		             {
		                $MQ(onload,{'src':src,'args':args});
		             }
				};
				// evaluate scripts
				contentHTML.evalScripts();
				Appcelerator.Compiler.compileElement(target.firstChild,state);
				state.scanned=true;
				Appcelerator.Compiler.checkLoadState(target);
			},true,true);
		}
	}
};

Appcelerator.Widget.register('app:content',Appcelerator.Widget.Content);
