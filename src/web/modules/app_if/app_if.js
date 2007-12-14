
Appcelerator.Module.If =
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
		return 1.0;
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
		return [{name: 'expr', optional: false, description: "The javascript expression to execute"}];
	},
	compileWidget: function(params)
	{
		var id = params['id'];
		
		if (eval(Appcelerator.Module.If.generateConditional(params['ifcond']['cond'])))
		{
			$(id).innerHTML = params['ifcond']['code'];
			Appcelerator.Compiler.dynamicCompile($(id));
		}
		else
		{
			for (var c=0;c<params['elseifconds'].length;c++)
			{
				var condition = params['elseifconds'][c];
				
				if (eval(Appcelerator.Module.If.generateConditional(condition['cond'])))
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
		Appcelerator.Module.If.uniqueFunctionId++;
		var fname = 'app_if_function'+'_'+Appcelerator.Module.If.uniqueFunctionId;
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

Appcelerator.Core.registerModule('app:if',Appcelerator.Module.If);