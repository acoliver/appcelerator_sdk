
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
		return 'http://appcelerator.org';
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
