Appcelerator.UI = Class.create();
Appcelerator.UI.UIManager = {};
Appcelerator.UI.UIComponents = {};

/**
 * called by an UI manager implementation to register itself by type
 */
Appcelerator.UI.registerUIManager = function(ui,impl)
{
	Appcelerator.UI.UIManager[ui] = impl;
};

/**
 * called by UI manager to register itself
 */
Appcelerator.UI.registerUIComponent = function(type,name,impl)
{
	Appcelerator.UI.UIComponents[type+':'+name] = impl;
};

/**
 * called to load UI component by UI manager
 */ 
Appcelerator.UI.loadUIComponent = function(type,name,element,options,failIfNotFound)
{
	var f = Appcelerator.UI.UIComponents[type+':'+name];
	if (f)
	{
		var formattedOptions = Appcelerator.UI.UIManager.parseAttributes(element,f,options);
		if (formattedOptions!=false)
		{
			f.build(element,formattedOptions);
		}
		if (f.getActions)
		{
			var actions = f.getActions();
			var id = element.id;
			for (var c=0;c<actions.length;c++)
			{
				(function()
				{
					var actionName = actions[c];
					var action = f[actionName];
					if (action)
					{
						Appcelerator.Compiler.buildCustomAction(actionName);
						var xf = function(id,m,data,scope,version,customActionArguments,direction,type)
						{
							try
							{
								action(id,formattedOptions,data,scope,version,customActionArguments,direction,type);
							}
							catch (e)
							{
								$E('Error executing '+actionName+' in container type: '+type+'. Error '+Object.getExceptionDetail(e)+', stack='+e.stack);
							}
						};
						Appcelerator.Compiler.attachFunction(id,actionName,xf);
					}
				})();
			}
		}
	}
	else
	{
		if (failIfNotFound)
		{
			$E('UI component type not found '+name);
		}
		else
		{
			element.state.pending+=1;
			Appcelerator.Core.requireCommonJS('appcelerator/'+type+'s/'+name+'/'+name+'.js',function()
			{
				Appcelerator.UI.loadUIComponent(type,name,element,options,true);
				element.state.pending-=1;
				if (Appcelerator.Compiler.checkLoadState(element.state))
				{
					element.state = null;
				}
			});
		}
	}
};

/**
 * called by a UI to load a UI manager
 */
Appcelerator.loadUIManager=function(ui,type,element,args,failIfNotFound)
{
	var f = Appcelerator.UI.UIManager[ui];
	if (f)
	{
		f(type,element,args);
	} 
	else
	{
		if (failIfNotFound)
		{
			$E('UI not found for '+ui+', type: '+type);
		}
		else
		{
			element.state.pending+=1;
			Appcelerator.Core.requireCommonJS('appcelerator/'+ui+'s/'+ui+'s.js',function()
			{
				Appcelerator.loadUIManager(ui,type,element,args,true);
				element.state.pending-=1;
				if (Appcelerator.Compiler.checkLoadState(element.state))
				{
					element.state = null;
				}
			});
		}
	}
};

Appcelerator.Compiler.registerAttributeProcessor('*','set',
{
	queue:[],
	handle: function(element,attribute,value)
	{
		// parse value
		var expressions = Appcelerator.Compiler.smartSplit(value,' and ');
		for (var i=0;i<expressions.length;i++)
		{
			// turn into comma-delimited string
			var delimitedString = expressions[i].replace("[",",").replace("]","");
			var a = delimitedString.split(",");
			
			// syntax: attribute[attributeType,arg1=val1,arg2=val2]
			var ui;
			var type;
			var args = {};

			for (var j=0;j<a.length;j++)
			{
				if (j==0)ui = a[0].trim();
				else if (j==1)type = a[1].trim();
				else
				{
					var pair = a[j].split("=");
					args[pair[0].trim()] = pair[1].trim();
				} 
			}
			element.stopCompile=true;
			Appcelerator.loadUIManager(ui,type,element,args);
		}
		Appcelerator.Compiler.compileElementChildren(element);

	},
	metadata:
	{
		description: (
			"set visual properties for an element"
		)
	}
});


Appcelerator.UI.UIManager.defaultThemes = 
	{'panel':'basic',
	 'shadow':'basic',
	 'button':'white_gradient',
	 'input':'white_gradient',
	 'textarea':'white_gradient',
	 'panel':'white',
	 'select':'thinline',
	 'tabpanel':'white'};

Appcelerator.UI.UIManager.getDefaultTheme = function(type)
{
	return Appcelerator.UI.UIManager.defaultThemes[type];
};
Appcelerator.UI.UIManager.setDefaultThemes = function(type,theme)
{
	Appcelerator.UI.UIManager.defaultThemes[type] = theme;
};


Appcelerator.UI.UIManager.attrToJSON = function(attrs)
{
	var a = attrs.split(",");
	
	var args = {};

	for (var j=0;j<a.length;j++)
	{
		var pair = a[j].split("=");
		args[pair[0].trim()] = pair[1].trim();
	}

	return args;
};

Appcelerator.UI.UIManager.parseAttributes = function(element,f,options)
{
	var moduleAttributes = f.getAttributes();
	for (var i = 0; i < moduleAttributes.length; i++)
	{
		var error = false;
		var modAttr = moduleAttributes[i];
		var value =  options[modAttr.name] || element.style[modAttr.name] || modAttr.defaultValue;
		// check and make sure the value isn't a function as what will happen in certain
		// situations because of prototype's fun feature of attaching crap on to the Object prototype
		if (Object.isFunction(value))
		{
			value = modAttr.defaultValue;
		}
		if (!value && !modAttr.optional)
		{
			Appcelerator.Compiler.handleElementException(element, null, 'required attribute "' + modAttr.name + '" not defined for ' + element.id);
			error = true;
		}
		options[modAttr.name] = value;
		if (error == true)
		{
			alert('error');
			return false;
		}
	}
	return options;
};

Appcelerator.UI.themes = {};

Appcelerator.Core.loadTheme = function(pkg,container,theme)
{
	var path = Appcelerator.UI.themes[theme];
	if (!path)
	{
		path = Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/' + pkg + 's/' + container + '/themes/' +theme+ '/' +theme+  '.css';
		Appcelerator.Core.remoteLoadCSS(path,function()
		{
			Appcelerator.UI.themes[theme]=path;
		});
	}
};
