Appcelerator.UI = Class.create();
Appcelerator.UI.UIManager = {managers:{}};
Appcelerator.UI.UIComponents = {};
Appcelerator.UI.UIListeners = {};

Appcelerator.UI.registerListener = function(type,name,event,callback)
{
	var f = function()
	{
		if (this.name == name || name == '*')
		{
			if (this.event == event || event == '*')
			{
				var scope = this.data || {};
				scope.type = this.type;
				scope.name = this.name;
				scope.event = this.event;
				callback.call(scope);
			}
		}
	};
	var listeners = Appcelerator.UI.UIListeners[type];
	if (!listeners)
	{
		listeners=[];
		Appcelerator.UI.UIListeners[type] = listeners;
	}
	listeners.push(f);
};

Appcelerator.UI.fireEvent = function(type,name,event,data)
{
	var listeners = Appcelerator.UI.UIListeners[type];
	if (listeners && listeners.length > 0)
	{
		var scope = {type:type,name:name,event:event,data:data};
		for (var c=0;c<listeners.length;c++)
		{
			listeners[c].call(scope);
		}
	}
};

/**
 * called by an UI manager implementation to register itself by type
 */
Appcelerator.UI.registerUIManager = function(ui,impl)
{
	Appcelerator.UI.UIManager.managers[ui] = impl;
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
Appcelerator.UI.loadUIComponent = function(type,name,element,options,failIfNotFound,callback)
{
	var f = Appcelerator.UI.UIComponents[type];
	if (f)
	{
		var formattedOptions = Appcelerator.UI.UIManager.parseAttributes(element,f,options);
		if (formattedOptions!=false)
		{
			try
			{
				f.build(element,formattedOptions);
			}
			catch (e)
			{
				Appcelerator.Compiler.handleElementException(element,e);
			}
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
		if (callback)
		{
			callback();
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
				Appcelerator.UI.loadUIComponent(type,name,element,options,true,callback);
				element.state.pending-=1;
				Appcelerator.Compiler.checkLoadState(element);
			},function()
			{
				Appcelerator.Compiler.handleElementException(element,'error loading '+type+'['+name+']');
				element.state.pending-=1;
				Appcelerator.Compiler.checkLoadState(element);
			});
		}
	}
};

/**
 * called by a UI to load a UI manager
 */
Appcelerator.loadUIManager=function(ui,type,element,args,failIfNotFound,callback)
{
	var f = Appcelerator.UI.UIManager.managers[ui];
	if (f)
	{
		var data = {element:element,args:args};
		Appcelerator.UI.fireEvent(ui,type,'beforeBuild',data);
		f(type,element,args,callback);
		Appcelerator.UI.fireEvent(ui,type,'afterBuild',data);
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
				Appcelerator.UI.fireEvent(ui,type,'register');
				Appcelerator.loadUIManager(ui,type,element,args,true,callback);
				element.state.pending-=1;
				Appcelerator.Compiler.checkLoadState(element.state);
			},function()
			{
				Appcelerator.Compiler.handleElementException(element,'error loading '+type+'['+name+']');
				element.state.pending-=1;
				Appcelerator.Compiler.checkLoadState(element.state);
			});
		}
	}
};

Appcelerator.Compiler.registerAttributeProcessor('*','set',
{
	queue:[],
	handle: function(element,attribute,value)
	{
		if (element != document.body)
		{
			// we wrap all set components in a container div
			var div = document.createElement('div');
			div.className = 'container';
			div.style.padding = '0';
			div.style.margin = '0';
			Appcelerator.Compiler.getAndEnsureId(div);
			element.wrap(div);
		}
		else
		{
			Element.addClassName(element,'container');
		}

		// parse value
		var expressions = Appcelerator.Compiler.smartSplit(value,' and ');
		var count = 0;
		var compiler = function()
		{
			count++;
			if (count == expressions.length)
			{
				Appcelerator.Compiler.compileElementChildren(element);
			}
		};
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
			if (i == 0) element.stopCompile=true;
			Appcelerator.loadUIManager(ui,type,element,args,false,compiler);
		}
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
			$E('error parsing attributes for '+element);
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
