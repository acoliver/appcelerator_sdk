Appcelerator.UI = Class.create();
Appcelerator.UI.UIManager = {managers:{}};
Appcelerator.UI.UIComponents = {};
Appcelerator.UI.UIListeners = {};

//FIXME FIXME -review this after port
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
		
		if (f.callbacks)
		{
			for (var c=0;c<f.callbacks.length;c++)
			{
				var entry = f.callbacks[c];
				entry.cb(impl,entry.el);
			}
			f.callbacks = null;
		}
	}
	catch(e)
	{
		Appcelerator.Compiler.handleElementException(null,e,'registerUIComponent for '+type+':'+name);
	}
};

Appcelerator.UI.loadUIComponent = function(type,name,element,options,callback)
{
	//FIXME - review options
	var f = Appcelerator.UI.UIComponents[type+':'+name];
	if (f)
	{
		if (f.loaded)
		{
			callback(f.impl);
		}
		else
		{
			f.callbacks = f.callbacks || [];
			f.callbacks.push({cb:callback,el:element});
		}
		return;
	}
	
	var dir = Appcelerator.ComponentPath + type + 's/' + name;
	var path = dir+'/'+name+'.js';
	Appcelerator.UI.UIComponents[type+':'+name] = {dir:dir,loaded:false,callbacks:[{cb:callback,el:element}]};

	if (element)
	{
		element.state.pending+=1;
	}
	
	Appcelerator.Core.remoteLoadScript(path,function()
	{
		if (element)
		{
			element.state.pending-=1;
			Appcelerator.Compiler.checkLoadState(element);
		}
	},function()
	{
		Appcelerator.UI.UIManager.handleLoadError(element,type,name,null,path);
		if (element)
		{
			element.state.pending-=1;
			Appcelerator.Compiler.checkLoadState(element);
		}
	});
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

Appcelerator.UI.ContainerManager = {};
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
	
	var defaultFieldset = formElement.getAttribute('fieldset') || formElement.id+'_fieldset';
	
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
			switch (node.tagName.toLowerCase())
			{
				case 'input':
				case 'select':
				case 'textarea':
				{
					if (node.getAttribute('type') == 'button')
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
					else
					{
						var fs = node.getAttribute('fieldset');
						if (!fs)
						{
							node.setAttribute('fieldset',defaultFieldset);
						}
						inputHTML.push({'element':node});
					}
					break;
				}
				case 'label':
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
					break;
				}
				case 'button':
				{
					if (Appcelerator.Browser.isIE)
					{
						buttonHTML.push(node.outerHTML);
					}
					else
					{
						buttonHTML.push(Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node)));	
					}
					break;
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
		var paddingBottom = "5px";
		if (buttonPos == "right")
		{
			html += '<tr><td></td><td align="left" colspan="1" style="padding-top:'+buttonPadding+';padding-bottom:'+paddingBottom+'">';
		}
		else
		{
			html += '<tr><td align="left" colspan='+colspan+' style="padding-top:'+buttonPadding+';padding-bottom:'+paddingBottom+'">';		
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
   Appcelerator.UI.loadUIComponent('layout',type,element,options,callback);
});

Appcelerator.UI.registerUIManager('behavior', function(type,element,options,callback)
{
   Appcelerator.UI.loadUIComponent('behavior',type,element,options,callback);
});

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
		$E('No UI manager for '+ui+'/'+type+' for element: '+element.id);
	}
};


Appcelerator.Compiler.registerAttributeProcessor('*','set',
{
	queue:[],
	handle: function(element,attribute,value)
	{
		var visibility = (element.style.visibility || 'visible');
		var show = false;
		
		if (!element.state) throw "invalid element state";

		if (visibility == 'visible')
		{
			element.style.visibility = 'hidden';
			element.style._visibility = 'visible';
			show = true;
		}
		
		Element.addClassName(element,'container');

		// parse value
		var expressions = Appcelerator.Compiler.smartSplit(value,' and ');
		var count = 0;
		var compiler = function(instance)
		{
			count++;
			element._component = instance;
			instance.onEvent('render',function(ev)
			{
				if (show)
				{
					element.style.visibility = element.style._visibility;
					show = false;
				}
			});
			instance.render(element);
			if (count == expressions.length)
			{
				Appcelerator.Compiler.parseOnAttribute(element);
				Appcelerator.Compiler.compileElementChildren(element);
			}
			element.state.pending-=1;
		    Appcelerator.Compiler.checkLoadState(element);
		};
		for (var i=0;i<expressions.length;i++)
		{
			var idx = expressions[i].indexOf('[');
			if (idx < 0)
			{
				throw new "invalid set expression. must be in the form: control[type]";
			}
			var lastIdx = expressions[i].lastIndexOf(']');
			var ui = expressions[i].substring(0,idx);
			var params = expressions[i].substring(idx+1,lastIdx);
			var comma = params.indexOf(',');
			var type = null, args = {};
			if (comma < 0)
			{
				type = params;
			}
			else
			{
				type = params.substring(0,comma);
				args = Appcelerator.Compiler.getParameters(params.substring(comma+1),true);
				for (var p in args)
				{
					args[p] = Appcelerator.Compiler.getEvaluatedValue(args[p]);
				}
			}
			if (i == 0) element.stopCompile=true;

			element.state.pending+=1;
			
			switch (ui)
			{
				case 'control':
					element._component = new AppControl(type,compiler,element);
					break;
				case 'theme':
					element._component = new AppTheme(type,compiler,element);
					break;
				case 'layout':
					element._component = new AppLayout(type,compiler,element);
					break;
				default:
				{
					throw "unknown component type: "+ui;
				}
			}
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

Appcelerator.UI.UIManager.getDefaultTheme = function(type)
{
	return Appcelerator.UI.UIManager.defaultThemes[type];
};

Appcelerator.UI.UIManager.setDefaultThemes = function(type,theme)
{
	Appcelerator.UI.UIManager.defaultThemes[type] = theme;
};


Appcelerator.UIProxy = Class.create(Appcelerator.Observer,
{
	initialize:function(name,options,el)
	{
	    if (!name) throw "Must specify name";
		this.name = name;
		this.readyState = 'INIT';
		this._renderTarget = el ? $(el) : null;
		this._events = [];
		if (options)
		{
			if (Object.isFunction(options))
			{
				this._events.push(['create',function(ev)
				{
					options(ev.data);
				}]);
			}
			else
			{
				for (var p in options)
				{
					var v = options[p];
					if (p.substring(0,2)=='on' && Object.isFunction(v))
					{
						var fn = p.charAt(2).toLowerCase()+p.substring(3);
						this._events.push([fn,v]);
					}
					else
					{
						this[p] = v;
					}
				}
			}
		}
		this._loadControl(this._type);
	},
	_loadControl:function(type)
	{
		Appcelerator.UI.loadUIComponent(type,this.name,null,null,function(factory)
		{
			var instance = factory.create();
			for (var c=0;c<this._events.length;c++)
			{
				instance.onEvent(this._events[c][0],this._events[c][1]);
			}
			instance.readyState = 'CREATING';
			var actions = [];
			var conditions = ['render'];
			function makeAction(instance,actionName,action)
			{
				var xf = function(id,m,data,scope,version,customActionArguments,direction,type)
				{
					try
					{
						var newparams = null;
						if (customActionArguments && customActionArguments.length > 0)
						{
							newparams = {};
							for (var x=0;x<customActionArguments.length;x++)
							{
								var entry = customActionArguments[x];
								var key = entry.key, value = entry.value;
								if (entry.keyExpression)
								{
									key = Appcelerator.Compiler.getEvaluatedValue(entry.key,null,scope,entry.keyExpression);
								}
								else if (entry.valueExpression)
								{
									value = Appcelerator.Compiler.getEvaluatedValue(entry.value,null,scope,entry.valueExpression);
								}
								else if (entry.empty)
								{
									newparams = Appcelerator.Compiler.getEvaluatedValue(entry.key,null,data);
									break;
								}
								else
								{
									key = Appcelerator.Compiler.getEvaluatedValue(entry.key);
									value = Appcelerator.Compiler.getEvaluatedValue(entry.value,null,scope);
								}
								newparams[key]=value;
							}
						}
						else
						{
							newparams = data;
						}
						action.apply(instance,[newparams]);
					}
					catch (e)
					{
						$E('Error executing '+actionName+' in container type: '+type+'. Error '+Object.getExceptionDetail(e)+', stack='+e.stack);
					}
				};
				actions.push([actionName,xf]);
			}
			var renderMapped = false;
			var attributes = instance.getAttributes();
			for (var c=0;c<attributes.length;c++)
			{
				if (attributes[c].name == 'render')
				{
					renderMapped = true; 
					break;
				}
			}
			if (!renderMapped)
			{
				attributes.push({name:'render',type:Appcelerator.Types.action});
			}
			var mappedRender = instance.render;
			var mappedElement = this._renderTarget;
			
			function registerActionConditions(element)
			{
				if (actions && element)
				{
					for (var c=0;c<actions.length;c++)
					{
						var actionName = actions[c][0];
						var xf = actions[c][1];
						Appcelerator.Compiler.buildCustomElementAction(actionName, element, xf);
					}
					actions = null;
				}
				if (conditions && element)
				{
					for (var c=0;c<conditions.length;c++)
					{
						var condName = conditions[c];
						var condFunct = Appcelerator.Compiler.customConditionFunctionCallback(condName);
			            Appcelerator.Compiler.registerCustomCondition({conditionNames: [condName]}, condFunct, element.id);
						instance.onEvent(condName,function(evt)
						{
							var p = evt.data || {};
							p.id = element.id;
							Appcelerator.Compiler.fireCustomCondition(element.id,evt.event,p);
						});
					}
					conditions = null;
				}
			}
			
			instance.render = function(element)
			{
				if (!element) return false;
				element = $(element);

				registerActionConditions(element);

				if (element) mappedElement = element;
				var result = mappedRender.call(instance,element);
										
				if (result)
				{
					instance.readyState = 'RENDERED';
					instance.fireEvent('render',instance);
				}
				
				return result;
			};
			// make a render action that will re-pass in the previous element to 
			// cause render. this action is only called from a web expression
			makeAction(instance,'render',function()
			{
				return instance.render(mappedElement);
			});
			for (var c=0;c<attributes.length;c++)
			{
				var entry = attributes[c];
				try
				{
					if (entry.type)
					{
						switch(entry.type)
						{
							case Appcelerator.Types.action:
							{
								break;
							}
							case Appcelerator.Types.condition:
							{
								conditions.push(entry.name);
								break;
							}
							default:
							{
								(function()
								{
									var actionName = entry.name;
									var mn =  actionName.charAt(0).toUpperCase() + actionName.substring(1);
									var setter = 'set' + mn;
									var action = instance[setter];
									if (action)
									{
										makeAction(instance,actionName,action);
									}
									var getter = 'get' + mn;
									if (!instance[getter])
									{
										instance[getter]=function()
										{
											return instance[actionName];
										};
									}
								})();
								break;
							}
						}
					}
				}
				catch(e)
				{
					Logger.error('error loading component = '+type+':'+this.name+'. Error = '+e);
					throw e;
				}
			}
			// if we have an element ref, go ahead and register
			if (mappedElement)
			{
				registerActionConditions(mappedElement);
			}
			instance.readyState = 'CREATED';
			instance.fireEvent('create',instance);
			// if they passed in a target render element, go ahead and render
			if (this._renderTarget) return instance.render(this._renderTarget);
		}.bind(this));
	}
});

AppControl = Class.create(Appcelerator.UIProxy.prototype,{_type:'control'});
AppTheme = Class.create(Appcelerator.UIProxy.prototype,{_type:'theme'});
AppLayout = Class.create(Appcelerator.UIProxy.prototype,{_type:'layout'});
AppBehavior = Class.create(Appcelerator.UIProxy.prototype,{_type:'behavior'});

