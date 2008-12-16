Appcelerator.UI.UIManager = {managers:{}};
Appcelerator.UI.UIComponents = {};

/////////////////////////////////////////////////////////////////////////
//
// Registration Functions
//
////////////////////////////////////////////////////////////////////////

//
// called by an UI manager implementation to register itself by type
//
Appcelerator.UI.registerUIManager = function(ui,impl)
{
	Appcelerator.UI.UIManager.managers[ui] = impl;
};

/**
 * called by UI manager to register itself
 */
Appcelerator.UI.registerUIComponent = function(type,name,impl)
{
	try
	{
		var f = Appcelerator.UI.UIComponents[type+':'+name];

		if (!f)
		{
			f = {};
			Appcelerator.UI.UIComponents[type+':'+name]=f;
		}

		f.impl = impl;
		f.loaded = true;

		if (impl.setPath)
		{
			impl.setPath.call(impl,f.dir);
		}

		if (f.elements)
		{
			for (var c=0;c<f.elements.length;c++)
			{
				var obj = f.elements[c];
				Appcelerator.UI.activateUIComponent(f.impl,f.dir,obj.type,obj.name,obj.element,obj.options,obj.callback);
			}

			f.elements = null;
		}
	}
	catch(e)
	{
		Appcelerator.Compiler.handleElementException(null,e,'registerUIComponent for '+type+':'+name);
	}
};


/////////////////////////////////////////////////////////////////////////
//
// Register Four Main UI Managers
//
////////////////////////////////////////////////////////////////////////

Appcelerator.UI.registerUIManager('layout', function(type,element,options,callback)
{
   Appcelerator.UI.loadUIComponent('layout',type,element,options,callback);
});


Appcelerator.UI.registerUIManager('behavior', function(type,element,options,callback)
{
   Appcelerator.UI.loadUIComponent('behavior',type,element,options,callback);
});

Appcelerator.UI.registerUIManager('theme', function(theme,element,options,callback)
{
	// is this a default setting
	if (theme == 'defaults')
	{
		for (var key in options)
		{
			Appcelerator.UI.UIManager.setDefaultThemes(key,options[key])
		}
		Appcelerator.Compiler.compileElementChildren(element);
	}
	else
	{
		Element.addClassName(element,'themed');
		var type = element.nodeName.toLowerCase();
		options['theme']=theme;
		Appcelerator.UI.loadUIComponent('control',type,element,options,callback);		
	}
});

Appcelerator.UI.widgetRegex = /^app:/
Appcelerator.UI.registerUIManager('control',function(type,element,options,callback)
{
	// check for backwards-porting of widgets
	// this will eventually be deprecated
	if (Appcelerator.UI.widgetRegex.test(type))
	{
	    var state = Appcelerator.Compiler.createCompilerState();
		state.pending+=1;
		state.scanned = true;
		Appcelerator.Core.requireModule(type,function()
		{
			var widgetJS = Appcelerator.Compiler.compileWidget(element,state,type);
			state.pending -= 1;
			Appcelerator.Compiler.checkLoadState(state);
			Element.fire(element,'element:compiled:'+element.id,{id:element.id});
		});
		return;
	}
    Element.addClassName(element,type);
    Appcelerator.UI.loadUIComponent('control',type,element,options,callback);
});

/////////////////////////////////////////////////////////////////////////
//
// UI Event Handling
//
////////////////////////////////////////////////////////////////////////


//
//  Fire UI Events
//
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

/////////////////////////////////////////////////////////////////////////
//
// Load and Activate UI Managers/Components
//
////////////////////////////////////////////////////////////////////////

//
// called by a UI to load a UI manager
//
Appcelerator.loadUIManager=function(ui,type,element,args,failIfNotFound,callback)
{
	var f = Appcelerator.UI.UIManager.managers[ui];
	if (f)
	{
		var data = {args:args,element:element};
		Appcelerator.UI.fireEvent(ui,type,'beforeBuild',data);
		var afterBuild = function(inst)
		{
			// pass instance in event
			data.instance = inst;
			Appcelerator.UI.fireEvent(ui,type,'afterBuild',data);
			
			// execute callback
			if (callback) callback.apply(inst);
		};
		f(type,element,args,afterBuild);
	} 
	else
	{
		if (failIfNotFound==true)
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
				Appcelerator.Compiler.handleElementException(element,null,'error loading '+type+'['+name+']');
				element.state.pending-=1;
				Appcelerator.Compiler.checkLoadState(element.state);
			});
		}
	}
};

//
// called to load UI component by UI manager
// 
Appcelerator.UI.loadUIComponent = function(type,name,element,options,callback)
{
	var f = Appcelerator.UI.UIComponents[type+':'+name];
	if (f)
	{
		if (f.loaded)
		{
			Appcelerator.UI.activateUIComponent(f.impl,f.dir,type,name,element,options,callback);
		}
		else
		{
			f.elements.push({type:type,name:name,element:element,options:options,callback:callback});
		}
	}
	else
	{
		// added for API calls
		if (!element.state)element.state = {pending:0};
		
		element.state.pending+=1;
		var dir = Appcelerator.DocumentPath + '/components/'+type+'s/'+name;
		var path = dir+'/'+name+'.js';
		Appcelerator.UI.UIComponents[type+':'+name] = {dir:dir,loaded:false,elements:[{type:type,name:name,element:element,options:options,callback:callback}]};

		Appcelerator.Core.remoteLoadScript(path,function()
		{
			element.state.pending-=1;
			Appcelerator.Compiler.checkLoadState(element);
		},function()
		{
			Appcelerator.UI.handleLoadError(element,type,name,null,path);
			element.state.pending-=1;
			Appcelerator.Compiler.checkLoadState(element);
		});
	}
};

//
// Instantiate UI component once loaded
//
Appcelerator.UI.activateUIComponent = function(impl,setdir,type,name,element,options,callback)
{
	var inst = null;
	var formattedOptions = null;
	try
	{
		// get instance
		inst = new impl.create();
		
		// get options
		formattedOptions = Appcelerator.UI.UIManager.parseAttributes(element,inst,options);
	
		// call build
		inst.build(element,formattedOptions);

		// keep track of elements and their UI attributes
		Appcelerator.UI.addElementUI(element,type,name,inst);

	}
	catch (e)
	{
		Appcelerator.Compiler.handleElementException(element,e,'activateUIComponent for '+type+':'+name);
	}
	if (inst.getActions)
	{
		var actions = inst.getActions();
		var id = element.id;
		for (var c=0;c<actions.length;c++)
		{
			(function()
			{
				var actionName = actions[c];
				var action = inst[actionName];
				if (action)
				{
					var xf = function(id,m,data,scope,version,customActionArguments,direction,type)
					{
						try
						{
							var obj = [{id:id,options:formattedOptions,data:data,scope:scope,args:customActionArguments,dir:direction,type:type}];
							action.apply(inst,obj);
						}
						catch (e)
						{
							$E('Error executing '+actionName+' in container type: '+type+'. Error '+Object.getExceptionDetail(e)+', stack='+e.stack);
						}
					};
					Appcelerator.Compiler.buildCustomElementAction(actionName, element, xf);
				}
			})();
		}
	}

	if (inst.getConditions)
	{
        Appcelerator.Compiler.customConditionObservers[element.id] = {};
        var customConditions = inst.getConditions();
        for (var i = 0; i < customConditions.length; i++)
        {
            var custCond = customConditions[i];
            var condFunct = Appcelerator.Compiler.customConditionFunctionCallback(custCond);
            Appcelerator.Compiler.registerCustomCondition({conditionNames: [custCond]}, 
                condFunct, element.id);
        }
	}
	
	Appcelerator.Compiler.parseOnAttribute(element);
	if (callback)
	{
		callback(inst);
	}
};

// 
// Keep track of an element's UI attributes (controls, behaviors, layouts, etc)
// This is used to faciliate dependency handling between controls and behaviors
// specifically if one element is using a certain control + one or more behaviors
// 
Appcelerator.UI.addElementUI = function(element, ui, type,inst)
{
	// is UI attribute combo part of an existing dependency
	var map = Appcelerator.UI.dependencyMap;
	for (var i=0;i<map.length;i++)
	{
		if (map[i].element.id == element.id)
		{
			// new UI + TYPE has a dependency for this element
			if ((map[i].dependencyUI == ui) && (map[i].dependencyType == type))
			{
				// see if element already has UI + TYPE 
				if (Appcelerator.UI.elementMap[element.id + "_" + map[i].ui + "_" + map[i].type])
				{
					map[i].callback(element);
				}
			}
		}
	}
	Appcelerator.UI.elementMap[element.id + "_" + ui + "_" + type] = {element:element,inst:inst};
	
};


/****************************************************
  HANDLE CROSS-CONTROL/BEHAVIOR/LAYOUT DEPENDENCIES
*****************************************************/
Appcelerator.UI.dependencyMap = [];

//
// allow components to register their dependencies for an element
//
Appcelerator.UI.addElementUIDependency = function(element,ui,type,dependencyUI, dependencyType, callback)
{

	// see if element already has UI attribute that is a dependency
	if (Appcelerator.UI.elementMap[element.id + "_" + dependencyUI +"_" + dependencyType])
	{
		callback(element);
	}
	
	// otherwise store it for later
	else
	{
		Appcelerator.UI.dependencyMap.push({element:element,ui:ui,type:type,dependencyUI:dependencyUI,dependencyType:dependencyType,callback:callback});	
	}
};



//
// Parse passed in attributes and make sure they match what 
// is supported by component
//
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



//
// called to handle load error
//
Appcelerator.UI.handleLoadError = function(element,type,name,subtype,path)
{
	$E("error loading - type:"+type+",name:"+name+",subtype:"+subtype+"\nfor "+element.id+' from url='+path);
	Appcelerator.Compiler.handleElementException(element,null,"couldn't load "+type+":"+name+" for : "+path);
};



