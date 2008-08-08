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
	var f = Appcelerator.UI.UIComponents[type+':'+name];
	if (f)
	{
		var formattedOptions = Appcelerator.UI.UIManager.parseAttributes(element,f,options);
		if (formattedOptions!=false)
		{
			try
			{
				f.build(element,formattedOptions);
				
				// keep track of elements and their UI attributes
				Appcelerator.UI.addElementUI(element,type,name);
				
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
						Appcelerator.Compiler.buildCustomElementAction(actionName, element, xf);
					}
				})();
			}
		}

		if (f.getConditions)
		{
            Appcelerator.Compiler.customConditionObservers[element.id] = {};
            var customConditions = f.getConditions();
            for (var i = 0; i < customConditions.length; i++)
            {
                var custCond = customConditions[i];
                var condFunct = Appcelerator.Compiler.customConditionFunctionCallback(custCond);
                Appcelerator.Compiler.registerCustomCondition({conditionNames: [custCond]}, 
                    condFunct, element.id);
            }
		}
		Appcelerator.Compiler.parseOnAttribute(element,true);
		if (callback)
		{
			callback();
		}
	}
	else
	{
		if (failIfNotFound==true)
		{
			Appcelerator.UI.UIManager.handleLoadError(element,type,name);
		}
		else
		{
			// added for API calls
			if (!element.state)element.state = {};
			
			element.state.pending+=1;
			var path = Appcelerator.DocumentPath + '/components/'+type+'s/'+name+'/'+name+'.js';
			Appcelerator.Core.remoteLoadScript(path,function()
			{
				Appcelerator.UI.loadUIComponent(type,name,element,options,true,callback);
				element.state.pending-=1;
				Appcelerator.Compiler.checkLoadState(element);
			},function()
			{
				Appcelerator.UI.UIManager.handleLoadError(element,type,name,null,path);
				element.state.pending-=1;
				Appcelerator.Compiler.checkLoadState(element);
			});
		}
	}
};

/**
 * called to handle load error
 */
Appcelerator.UI.UIManager.handleLoadError = function(element,type,name,subtype,path)
{
	$E("error loading - type:"+type+",name:"+name+",subtype:"+subtype+"\nfor "+element.id+' from url='+path);
	//TODO: determine if we're online or offline to determine action here
	//FIXME: add widget error handling
	//top.document.location.href = Appcelerator.DocumentPath + 'component_notfound.html?type='+encodeURIComponent(type)+'&name='+encodeURIComponent(name)+'&url='+encodeURIComponent(top.document.location.href)+'&'+(subtype ? ('&subtype='+encodeURIComponent(subtype)) : '');
};

/************************************
 *  API FUNCTIONS
 ***********************************/
Appcelerator.UI.createControl = function (element,type,args)
{
	Appcelerator.loadUIManager('control',type,element,(args)?args:{},false);
};
Appcelerator.UI.addBehavior = function(element,type,args)
{
	Appcelerator.loadUIManager('behavior',type,element,(args)?args:{},false);
};
Appcelerator.UI.createLayout = function(element,type,args)
{
	Appcelerator.loadUIManager('layout',type,element,(args)?args:{},false);
};

/****************************************************
  HANDLE CROSS-CONTROL/BEHAVIOR/LAYOUT DEPENDENCIES
*****************************************************/
Appcelerator.UI.dependencyMap = [];
Appcelerator.UI.elementMap = {};

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
// Keep track of an element's UI attributes (controls, behaviors, layouts, etc)
// 
Appcelerator.UI.addElementUI = function(element, ui, type)
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
	Appcelerator.UI.elementMap[element.id + "_" + ui + "_" + type] = {element:element};
	
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
		var afterBuild = function()
		{
			Appcelerator.UI.fireEvent(ui,type,'afterBuild',data);
			if (callback) callback();
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
			//FIXME
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
		Element.addClassName(element,'container');

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
{
	'panel':'basic',
	'shadow':'basic',
	'button':'white_gradient',
	'input':'white_gradient',
	'textarea':'white_gradient',
	'select':'thinline',
	'tabpanel':'white',
	'accordion':'basic'
};

//FIXME - change to add type (control, behavior)

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

Appcelerator.Core.registerTheme = function(type,container,theme,impl)
{
	var key = Appcelerator.Core.getThemeKey(type,container,theme);
	var themeImpl = Appcelerator.UI.themes[key];
	if (!themeImpl)
	{
		themeImpl = {};
		Appcelerator.UI.themes[key] = themeImpl;
	}
	themeImpl.impl = impl;
	themeImpl.loaded = true;
	// trigger on registration any pending guys
	Appcelerator.Core.loadTheme(type,container,theme,null,null);
};

Appcelerator.Core.getThemeKey = function(pkg,container,theme)
{
	return pkg + ':' + container + ':' + theme;
};

Appcelerator.Core.loadTheme = function(pkg,container,theme,element,options)
{
	theme = theme || Appcelerator.UI.UIManager.getDefaultTheme(container);
	var key = Appcelerator.Core.getThemeKey(pkg,container,theme);
	var themeImpl = Appcelerator.UI.themes[key];
	var fetch = false;

	if (!themeImpl)
	{
		themeImpl = { callbacks: [], impl: null, loaded: false };
		Appcelerator.UI.themes[key] = themeImpl;
		fetch = true;
	}
	
	if (themeImpl.loaded)
	{
		if (themeImpl.callbacks && themeImpl.callbacks.length > 0 && themeImpl.impl && themeImpl.impl.build)
		{
			for (var c=0;c<themeImpl.callbacks.length;c++)
			{
				var callback = themeImpl.callbacks[c];
				themeImpl.impl.build(callback.element,callback.options);
			}
		}
		if (element!=null && options!=null && themeImpl.impl && themeImpl.impl.build)
		{
			themeImpl.impl.build(element,options);
		}
		themeImpl.callbacks = null;
	}
	else
	{
		themeImpl.callbacks.push({element:element,options:options});
	}
	
	if (fetch)
	{
		var css_path = Appcelerator.DocumentPath + '/components/' + pkg + 's/' + container + '/themes/' +theme+ '/' +theme+  '.css';
		Appcelerator.Core.remoteLoadCSS(css_path);

		var js_path = Appcelerator.DocumentPath + '/components/' + pkg + 's/' + container + '/themes/' +theme+ '/' +theme+  '.js';
		Appcelerator.Core.remoteLoadScript(js_path,null,function()
		{
			Appcelerator.UI.UIManager.handleLoadError(element,pkg,theme,container);
		});
	}
};

//
// this is a special type of UI manager always available
//
Appcelerator.UI.registerUIManager('theme', function(theme,element,options,callback)
{
	// is this a default setting
	if (theme == 'defaults')
	{
		for (var key in options)
		{
			Appcelerator.UI.UIManager.setDefaultThemes(key,options[key])
		}
	}
	else
	{
		Element.addClassName(element,'themed');
		var type = element.nodeName.toLowerCase();
		options['theme']=theme;
		Appcelerator.UI.loadUIComponent('control',type,element,options,false,callback);		
	}
});

Appcelerator.UI.ContainerManager = {};
Appcelerator.UI.widgetRegex = /^app:/

Appcelerator.UI.registerUIManager('control',function(type,element,options,callback)
{
	// check for backwards-porting of widgets
	// this will eventually be deprecated
	if (Appcelerator.UI.widgetRegex.test(type))
	{
	    var state = Appcelerator.Compiler.createCompilerState();
		state.pending += 1;
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
    Appcelerator.UI.loadUIComponent('control',type,element,options,false,callback);
});

Appcelerator.UI.LayoutManager = {};
Appcelerator.UI.LayoutManager._formatTable = function(options)
{
   return '<table width="'+options['width']+'" cellspacing="'+(options['cellspacing'] || '') +'" cellpadding="'+ (options['cellpadding'] || '0') + '">';
};

Appcelerator.UI.LayoutManager._buildForm = function(options)
{
	var childNodes = options['childNodes'];
	var html = options['html'];
	var align = options['align'];
	var colspan = options['colspan'];
	var hintPos = options['hintPos'];
	var errorPos = options['errorPos'];
	var buttonPos = options['buttonPos'];
	var labelWidth = options['labelWidth'];
	var formElement = options['element'];
	
	var inputHTML = [];
	var labelHTML = [];
	var buttonHTML = [];
	var hintHTML = [];
	var errorHTML = [];
	for (var c=0,len=childNodes.length;c<len;c++)
	{
		var node = childNodes[c];
		if (node.nodeType == 1)
		{
			if (node.tagName.toLowerCase() == 'input' || node.tagName.toLowerCase()== 'select' 
				|| node.tagName.toLowerCase() == 'textarea')
			{
				inputHTML.push({'element':node});
			}
			else if (node.tagName.toLowerCase() == 'label')
			{
				if (Appcelerator.Browser.isIE)
				{
					if (node.getAttribute("type") == "hint")
					{
						hintHTML.push({'id':node.htmlFor,'element':node,'html':node.outerHTML});
					}
					else if (node.getAttribute("type") == "error")
					{
						errorHTML.push({'id':node.htmlFor,'element':node,'html':node.outerHTML});
					}
					else
					{
						labelHTML.push({'id':node.htmlFor,'element':node,'html':node.outerHTML});						
					}
				}
				else
				{
					if (node.getAttribute("type") == "hint")
					{
						hintHTML.push({'id':node.getAttribute('for'),'element':node,'html':Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node))});
					}
					else if (node.getAttribute("type") == "error")
					{
						errorHTML.push({'id':node.getAttribute('for'),'element':node,'html':Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node))});
					}
					else
					{
						labelHTML.push({'id':node.getAttribute('for'),'element':node,'html':Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node))});						
					}
					
				}
			}
			else if ((node.tagName.toLowerCase() == 'button') || (node.getAttribute('type') == 'button'))
			{
				if (Appcelerator.Browser.isIE)
				{
					buttonHTML.push(node.outerHTML);
				}
				else
				{
					buttonHTML.push(Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node)));	
				}
			}
		}	
	}
	// 
	// horizontal: hint (top, right, bottom, input), error (top, right, bottom)
	// vertical: hint (top, right, bottom, input), error (top, right, bottom)
	// 
	for (var x=0;x<inputHTML.length;x++)
	{
		(function()
		{
			var label = '';
			var error = ''
			var hint = '';
			var input = '';
			input = inputHTML[x].element;

			// define label for this input
			label = '';
			for (var i=0;i<labelHTML.length;i++)
			{
				if (labelHTML[i].id == input.id)
				{
					label = labelHTML[i].html;
					break;
				}
			}

			// define error for this input
			error = ''
			for (var i=0;i<errorHTML.length;i++)
			{
				if (errorHTML[i].id == input.id)
				{
					error = errorHTML[i].html;
					break;
				}
			}

			// define hint for this input
			hint = '';
			for (var i=0;i<hintHTML.length;i++)
			{
				if (hintHTML[i].id == input.id)
				{
					hint = (hintPos == 'input')?hintHTML[i].element.innerHTML:hintHTML[i].html;
					break;
				}
			}

			if (align=='horizontal')
			{
				var valign = 'middle';
				var labelPadding = "5px";
				var inputPadding = "5px";
				var topPadding = "0px";
				if ((errorPos == 'top' || errorPos == 'bottom')&&((hintPos == 'top' || hintPos == 'bottom')))
				{
					valign = "middle";				
					labelPadding = "15px"
				}
				
				else if (errorPos == 'top' || hintPos == 'top')
				{
					valign = "bottom";
				}
				else if (errorPos=='bottom' || hintPos=='bottom')
				{
					valign = "top";
					topPadding = "4px"
				}
				// create form
				if ((labelPadding == "5px")  && (hintPos != 'bottom') && (errorPos != 'bottom'))
				{
					labelPadding = "9px";
				}
				
				html += '<tr><td align="left" valign="'+valign+'" width="'+labelWidth+'" style="padding-bottom:'+labelPadding+';padding-top:'+topPadding+'" >' + label + '</td>';
				html += '<td align="left" style="padding-bottom:'+inputPadding+'">';
				html += (hintPos == "top")?'<div>'+hint+'</div>':'';
				html += (errorPos == "top")?'<div>'+error+'</div>':'';
				html += Appcelerator.Util.Dom.toXML(input,true,Appcelerator.Compiler.getTagname(input));
				html += (hintPos == "right")?'<span style="padding-left:5px">'+hint+'</span>':'';
				html += (errorPos == "right")?'<span style="padding-left:5px">'+error+'</span>':'';
				html += (hintPos == 'bottom')?'<div style="margin-bottom:10px;position:relative;top:-1px">'+hint + '</div>':'';				
				html += (errorPos == 'bottom')?'<div style="margin-bottom:10px;position:relative;top:-1px">'+error + '</div>':'';
				html += '</td></tr>';
			}
			else
			{
				// create form
				html += '<tr><td align="left">' + label;
				html += (hintPos == "top")?'<span style="padding-left:5px">'+hint+'</span>':'';
				html += (errorPos == "top")?'<span style="padding-left:5px">'+error+'</span>':'';
				html += '</td></tr><tr>';
				html += (errorPos != 'bottom' && hintPos != 'bottom')?'<td align="left" style="padding-bottom:5px">':'<td align="left">';
				html += Appcelerator.Util.Dom.toXML(input,true,Appcelerator.Compiler.getTagname(input));
				html += (hintPos == "right")?'<span style="padding-left:5px">'+hint+'</span>':'';
				html += (errorPos == "right")?'<span style="padding-left:5px">'+error+'</span>':'';
				html += (hintPos == 'bottom')?'<div style="margin-bottom:5px;position:relative;top:-1px">'+hint + '</div>':'';				
				html += (errorPos == 'bottom')?'<div style="margin-bottom:5px;position:relative;top:-1px">'+error + '</div>':'';
				html += '</td></tr>';

			}
			if (options['hintPos'] == "input")
			{
				formElement.observe('element:compiled:'+formElement.id,function(a)
				{
					if (hintPos == "input")
					{
						$(input.id).value = hint;
						Element.addClassName($(input.id),'layout_form_hinttext');
					}

					Event.observe(input.id,'click',function(e)
					{
						if ($(input.id).value == hint)
						{
							$(input.id).value = '';
							Element.removeClassName($(input.id),'layout_form_hinttext');
						}
					});
					Event.observe(input.id,'blur',function(e)
					{
						if ($(input.id).value == '')
						{
							$(input.id).value = hint;
							Element.addClassName($(input.id),'layout_form_hinttext');

						}
					});
				});
			}
		})();
	}
	if (buttonHTML.length > 0)
	{
		var buttonPadding = (errorPos == 'bottom' || hintPos == 'bottom')?"0px":"5px";
		if (buttonPos == "right")
		{
			html += '<tr><td></td><td align="left" colspan="1" style="padding-top:'+buttonPadding+'">';
		}
		else
		{
			html += '<tr><td align="left" colspan='+colspan+' style="padding-top:'+buttonPadding+'">';		
		}
		for (var y=0;y<buttonHTML.length;y++)
		{
			html += buttonHTML[y] + '<span style="padding-right:10px"></span>';
		}
		html += '</td></tr>';
		
	}
	html +="</table>";
	return html;
};

Appcelerator.UI.registerUIManager('layout', function(type,element,options,callback)
{
   Element.addClassName(element,'layout');
   Element.addClassName(element,type);
   Appcelerator.UI.loadUIComponent('layout',type,element,options,false,callback);
});

Appcelerator.UI.registerUIManager('behavior', function(type,element,options,callback)
{
   Appcelerator.UI.loadUIComponent('behavior',type,element,options,false,callback);
});


