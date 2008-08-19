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


Appcelerator.Widget.If =
{
	getName: function()
	{
		return 'appcelerator if';
	},
	getDescription: function()
	{
		return 'if widget';
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
		return 'app:if';
	},
	getAttributes: function()
	{        
        return [{
            name: 'expr',
            optional: false,
            type: Appcelerator.Types.javascriptExpr,
            description: "The javascript expression to execute"
        }];
	},
	getChildNodes: function()
	{        
        return [{
            name: 'else',
			optional: true,
			maxNumber: 1
        }, {
			name: 'elseif',
			optional: true,
			attributes: [{
				name: 'expr',
				optional: false,
				type: Appcelerator.Types.javascriptExpr
			}]
		}];
	},
	compileWidget: function(params)
	{
		var id = params['id'];
		
		if (eval(Appcelerator.Widget.If.generateConditional(params['ifcond']['cond'])))
		{
			$(id).innerHTML = params['ifcond']['code'];
			Appcelerator.Compiler.dynamicCompile($(id));
		}
		else
		{
			for (var c=0;c<params['elseifconds'].length;c++)
			{
				var condition = params['elseifconds'][c];
				
				if (eval(Appcelerator.Widget.If.generateConditional(condition['cond'])))
				{
					$(id).innerHTML = condition.code;
					Appcelerator.Compiler.dynamicCompile($(id));
					return;
				}
			}
			
			var elsecond = params['elsecond'];
			if (elsecond)
			{
				$(id).innerHTML = elsecond.code;
				Appcelerator.Compiler.dynamicCompile($(id));
			}
		}
	},
	uniqueFunctionId: 0,
	generateConditional: function(code)
	{
		Appcelerator.Widget.If.uniqueFunctionId++;
		var fname = 'app_if_function'+'_'+Appcelerator.Widget.If.uniqueFunctionId;
		var code = 'var '+fname+' = function () { if ('+code+')';
		code += '{ return true; }';
		code += 'else { return false; }};';
		code += fname+'();';
		return code;		
	},
	buildWidget: function(element,params)
	{
		var ifcond = {code: '', cond: params['expr']};
		var elseifconds = [];
		var elsecond;
		
		if (Appcelerator.Browser.isIE)
		{
			// NOTE: in IE, you have to append with namespace
			var newhtml = element.innerHTML;
			newhtml = newhtml.replace(/<ELSEIF/g,'<APP:ELSEIF').replace(/\/ELSEIF>/g,'/APP:ELSEIF>');
			newhtml = newhtml.replace(/<ELSE/g,'<APP:ELSE').replace(/\/ELSE>/g,'/APP:ELSE>');
			element.innerHTML = newhtml;
		}
		
        if (Appcelerator.Browser.isOpera)
        {
            // NOTE: opera returns case-sensitive tag names, causing the conditions to fail
            var newhtml = element.innerHTML;
            newhtml = newhtml.replace(/<ELSEIF/gi,'<ELSEIF').replace(/\/ELSEIF>/gi,'/ELSEIF>');
            newhtml = newhtml.replace(/<ELSE/gi,'<ELSE').replace(/\/ELSE>/gi,'/ELSE>');
            element.innerHTML = newhtml;
        }
        
		for (var c=0; c<element.childNodes.length; c++)
		{
			(function()
			{
				var code, cond;
				var node = element.childNodes[c];
				
				if (node.nodeType == 1 && node.nodeName == 'ELSEIF')
				{
					if (elsecond)
					{
						throw ('syntax error: elseif after an else detected.');
					}
					elseifconds.push({code: Appcelerator.Compiler.getHtml(node), cond: node.getAttribute('expr')});
				}
				else if (node.nodeType == 1 && node.nodeName == 'ELSE')
				{
					if (elsecond)
					{
						throw ('syntax error: more than one else statement detected.');
					}
					elsecond = {code: Appcelerator.Compiler.getHtml(node)};
				}
				else if (node.nodeType == 1)
				{
					if (elsecond || elseifconds.length > 0)
					{
						throw ('syntax error: html code after an else or elseif detected.');
					}
					ifcond['code'] += Appcelerator.Compiler.convertHtml(Appcelerator.Util.Dom.toXML(node, true), true);
				}
				else if (node.nodeType == 3)
				{
					var val = node.nodeValue.trim();
					if ((elsecond || elseifconds.length > 0) && val.length > 0)
					{
						throw ('Html code after an else or elseif detected.');
					}
					ifcond['code'] += val;					
				}
			})();
		}
		
		params['ifcond'] = ifcond;		
		params['elseifconds'] = elseifconds;
		params['elsecond'] = elsecond;

		return {
			'presentation' : '',
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'compile' : true
		};
	}
};

Appcelerator.Widget.register('app:if',Appcelerator.Widget.If);
