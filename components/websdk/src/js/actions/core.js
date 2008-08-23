Appcelerator.Compiler.registerCustomAction('show',
{
	execute: function(id, action, params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			Element.show(key);
		}
		else
		{
		    Element.show(id);
		}
	}
});

Appcelerator.Compiler.registerCustomAction('hide',
{
	execute: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			Element.hide(key);
		}
		else
		{
		    Element.hide(id);
		}
	}
});

Appcelerator.Compiler.registerCustomAction('visible',
{
	execute: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			Element.setStyle(key, {visibility:'visible'});
		}
		else
		{
			Element.setStyle(id, {visibility:'visible'});
		}
	}
});

Appcelerator.Compiler.registerCustomAction('hidden',
{
	execute: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			Element.setStyle(key, {visibility:'hidden'});
		}
		else
		{
			Element.setStyle(id, {visibility:'hidden'});
		}
	}
});

// get the effects
Appcelerator.Compiler.effects = $H(Effect).select(function(kv) {
    var name = kv[0];
    var val = kv[1];
    var lowerName = name.charAt(0).toLowerCase() + name.substring(1);
    return Effect.Methods[lowerName] || val.superclass == Effect.Base;
}).pluck('0');

Appcelerator.Compiler.customEffects = {};

Appcelerator.Compiler.registerCustomEffect = function(effect,callback)
{
	Appcelerator.Compiler.customEffects[effect] = callback;
};

Appcelerator.Compiler.getMoveByOpts = function(params)
{
	var x = Appcelerator.Compiler.findParameter(params,'x');
	x  = (x==null)?0:x;
	var y = Appcelerator.Compiler.findParameter(params,'y');
	y  = (y==null)?0:y;
	var duration = Appcelerator.Compiler.findParameter(params,'duration');
	duration  = (duration==null)?2:duration;
	return {'x':x,'y':y,'duration':duration};
}

Appcelerator.Compiler.registerCustomEffect('Bounce', function(id,params)
{
	opts = Appcelerator.Compiler.getMoveByOpts(params)
	new Effect.MoveBy( $(id), opts['x'], opts['y'], {duration: opts['duration'], transition: Effect.Transitions.SwingTo});
		
});
Appcelerator.Compiler.registerCustomEffect('Bang', function(id,params)
{
	opts = Appcelerator.Compiler.getMoveByOpts(params)
	new Effect.MoveBy( $(id), opts['x'], opts['y'], {duration: opts['duration'], transition: Effect.Transitions.Bounce});
		
});

Appcelerator.Compiler.registerCustomAction('effect',
{
	metadata:
	{
		requiresParameters: true,
		shorthandParameters: true,
		optionalParameterKeys: Appcelerator.Compiler.effects,
	    description: "Invokes a Scriptaculous visual effect on this element"
	},

	execute: function(id,action,params)
	{
		if (params && params.length > 0)
		{

			// split first param to get effect name
			var arg1= params[0].key.split(",");
			var effectName = arg1[0];
			effectName = effectName.dasherize().camelize();
		  	effectName = effectName.charAt(0).toUpperCase() + effectName.substring(1);

			// check for standard effects
			if (Appcelerator.Compiler.effects.indexOf(effectName) != -1)
			{
				var options = {};
				var target=id

				// get remaining options
				if (params.length > 1)
				{
					for (var c=1;c<params.length;c++)
					{
						// if option is id, set target element for effect
						if (params[c].key=="id")
						{
							target = params[c].value;
						}
						// is it a transition
						else if (params[c].key == "transition")
						{
						    options[params[c].key] = eval(params[c].value);
						}
						// otherwise, its an effect option
						else
						{
						    options[params[c].key] = params[c].value;
							
						}
					}
				}

				Element.visualEffect(target,effectName,options);
				
			}
			else if (Appcelerator.Compiler.customEffects[effectName])
			{
				var f = Appcelerator.Compiler.customEffects[effectName];
				f(id,params);
			}
			else
			{
				throw "syntax error: unsupported effect type: "+effectName;				
			}
		}
		else
		{
			throw "syntax error: effect action must have parameters";
		}
	}
});


Appcelerator.Compiler.registerCustomAction('toggle',
{
	metadata:
	{
		requiresParameters: true,
		description: "Toggles a CSS property, CSS Class, or boolean attribute on this element"
	},
	execute: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			var val = obj.value;
			var code = null;
			if (key == 'class')
			{
			    if (Element.hasClassName(id,val))
			    {
			        Element.removeClassName(id,val);
			    }
			    else
			    {
			        Element.addClassName(id,val);
		        }
			}
			else
			{
				if (Appcelerator.Compiler.isCSSAttribute(key))
				{
					key = Appcelerator.Compiler.convertCSSAttribute(key);
					switch (key)
					{
						case 'display':
						case 'visibility':
						{
							var opposite = '';
							if (!val)val = (key =='display') ? 'block': 'visible';
							switch(val)
							{
								case 'inline':
									opposite='none';break;
								case 'block':
									opposite='none'; break;
								case 'none':
									opposite='block'; break;
								case 'hidden':
									opposite='visible'; break;
								case 'visible':
									opposite='hidden'; break;
							}
							var a = Element.getStyle(id,key);
						    var params = {};
							if (a!=opposite)
							{
							    params[key] = opposite;
							}
							else
							{
							    params[key] = val;
						    }
						    Element.setStyle(id,params);
							break;
						}
						default:
						{
							var a = Element.getStyle(id, key);
						    var params = {};
							if (a)
							{
							    params[key] = '';
							}
							else
							{
							    params[key] = val;
						    }
						    Element.setStyle(id,params);
							break;
						}
					}
				}
				else
				{
					var a = $(id);
					if (!a)
					{
					    throw "no element with ID: "+id;
					}
					var v = a.getAttribute(key);
					if (v)
					{
					    a.removeAttribute(key);
					}
					else
					{
					    a.setAttribute(key,val);
				    }
				}
			}
		}
		else
		{
			throw "syntax error: toggle action must have parameters";
		}
	}
});

Appcelerator.Compiler.generateSetter = function(value,scope)
{
    if (scope)
    {
    	return Appcelerator.Compiler.getEvaluatedValue(value,scope.data||{});
    }
    else
    {
    	return Appcelerator.Compiler.getEvaluatedValue(value,{});
    }
};

(function()
{
	var addsetBuildFunction = function(id,action,params,scope)
	{
		if (params.length == 0)
		{
			throw "syntax error: expected parameter key:value for action: "+action;
		}
		
		var setStyles = null;
		
		for (var c=0;c<params.length;c++)
		{
			var obj = params[c];
			var key = obj.key;
			var value = obj.value;
			if (Appcelerator.Compiler.isCSSAttribute(key))
			{
				key = Appcelerator.Compiler.convertCSSAttribute(key);
				if (!setStyles) setStyles = {};
				setStyles[key] = Appcelerator.Compiler.generateSetter(value,scope);
				continue;
			}
			else if (key == 'class')
			{
				if (action=='set')
				{
					$(id).className = Appcelerator.Compiler.generateSetter(value,scope);
				}
				Element.addClassName(id, Appcelerator.Compiler.generateSetter(value,scope));
			}
			else if (key.startsWith('style'))
			{
			    $(id)[key] = Appcelerator.Compiler.generateSetter(value,scope);
		    }
		    else
		    {
				var e = $(id);
				if (!e)
				{
				    throw "syntax error: element with ID: "+id+" doesn't exist";
				}
				if (e.nodeName=='IFRAME' && key=='src')
				{
				    var onload = e.getAttribute('onloaded');
				    if (onload)
				    {
				        Appcelerator.Util.IFrame.monitor(e, function()
				        {
				            $MQ(onload,{},e.scope);
				        });
			        }
			    }
				if (e[key]!=null)
				{
	    			switch(key)
	    			{
	    				case 'checked':
	    				case 'selected':
	    				case 'disabled':
	    				{
	    				    e[key] = ('true' == Appcelerator.Compiler.generateSetter(value,scope));
	    					break;
						}
	    				default:
	    				{
	            			var isOperaSetIframe = Appcelerator.Browser.isOpera && e.nodeName=='IFRAME' && key=='src';
	    				    if (isOperaSetIframe)
	    				    {
	    				        e.location.href = Appcelerator.Compiler.generateSetter(value,scope);
	    				    }
	    				    else
	    				    {
	    				        e[key] = Appcelerator.Compiler.generateSetter(value,scope);
	    				    }
						}
	    			}
			    }
			    else
			    {
			        e.setAttribute(key, Appcelerator.Compiler.generateSetter(value,scope));
			    }
			}
		}
		if (setStyles)
		{
			Element.setStyle(id, setStyles);
		}
	}

    Appcelerator.Compiler.registerCustomAction('add',
	{
		metadata:
		{
			description: "Add a CSS property or attribute on this element"
		},
		execute: addsetBuildFunction
	});
    Appcelerator.Compiler.registerCustomAction('set',
    {
        metadata:
        {
            description: "Set a CSS property or attribute on this element"
        },
        execute: addsetBuildFunction
    });
})();

Appcelerator.Compiler.registerCustomAction('remove',
{
	execute: function(id,action,params)
	{
		if (params.length == 0)
		{
			throw "syntax error: expected parameter key:value for action: "+action;
		}
		var obj = params[0];
		var key = obj.key;
		var value = obj.value;
		switch (key)
		{
			case 'class':
			    Element.removeClassName(id,Appcelerator.Compiler.formatValue(value,false));
			    break;
			default:
    			$(id).removeAttribute(key);
		}
	}
});

Appcelerator.Compiler.registerCustomAction('statechange',
{
	metadata:
	{
		requiresParameters: true
	},
	execute: function(id,action,params)
	{
		if (params.length == 0)
		{
			throw "syntax error: expected parameters in format 'statechange[statemachine=state]'";
		}

		var changes = params.map(function(obj)
		{
			var statemachine = obj.key;
			var state = obj.value;
			Appcelerator.Compiler.StateMachine.fireStateMachineChange(statemachine,state,true,true,false);
		});
	}
});

(function()
{
	var scriptBuilderAction =
	{
		metadata:
        {
            requiresParameters: true,
			description: "Executes a line of javascript"
        },
	    //
	    // define a custom parsing routine for parameters
	    // that will just take in as-is everything inside
	    // [ ] as the code to execute
	    //
	    parseParameters: function (id,action,params)
	    {
	        return params;
	    },
	    execute: function (id,action,params,scope)
	    {   
	        var f = function() { eval(params); }.bind(scope);
	        f();
	    }
	};


	Appcelerator.Compiler.registerCustomAction('javascript',scriptBuilderAction);
	Appcelerator.Compiler.registerCustomAction('function',scriptBuilderAction);
	Appcelerator.Compiler.registerCustomAction('script',scriptBuilderAction);
})();


Appcelerator.Compiler.findParameter = function(params,key)
{
	if (params)
	{
		if (params[key])
		{
			return params[key];
		}
		else
		{
			if (params.length > 0)
			{
				for (var c=0;c<params.length;c++)
				{
					var obj = params[c];
					if (obj.key == key)
					{
						return obj.value;
					}
				}
			}
		}
	}
	return null;
}

Appcelerator.Compiler.registerCustomAction('selectOption',
{
	execute: function(id,action,params,scope)
	{
		if (params.length == 0)
		{
			throw "syntax error: expected parameter property for action: "+action;
		}
		var select = $(id);

		if (!select.options)
		{
			throw "syntax error: selectOption must apply to a select tag";
		}

		var key = params[0].key;
		var def = params[0].value || key;
		if (def=='$null')
		{
			def = '';
		}

		var selectedValue = Object.getNestedProperty(scope.data, key, def);
		var targetSelect = $(id);
		var isArray = Object.isArray(selectedValue);

        targetSelect.selectedIndex = -1;

		for (var j=0;j<targetSelect.options.length;j++)
		{
			if (isArray)
			{
				targetSelect.options[j].selected = selectedValue.include(targetSelect.options[j].value);
			}
			else
			{
			    if (targetSelect.options[j].value == selectedValue)
			    {
			        targetSelect.selectedIndex = j;
			        break;
			    }
			}
		}
		Appcelerator.Compiler.executeFunction(targetSelect,'revalidate');
	}
});

var ResetAction =
{
	execute: function(id,action,params)
	{
		var target = Appcelerator.Compiler.findParameter(params,'id') || id;
		var element = $(target);
		var revalidate = false;
		var code = null;

		var element = $(target);
		var variable = '';
		var value = '';

		switch (Appcelerator.Compiler.getTagname(element))
		{
			case 'input':
			case 'textarea':
			{
			    element.value = value;
				revalidate=true;
				break;
			}
			case 'select':
			{
			    element.selectedIndex = 0;
				revalidate=true;
				break;
			}
			case 'img':
			{
			    element.src = '';
				break;
			}
			case 'a':
			{
			    element.href = '#';
				break;
			}
			case 'form':
			{
				Form.reset(target);
				Form.Methods.getInputs(target).each(function(i)
				{
				    Appcelerator.Compiler.executeFunction(i,'revalidate');
				});
                return;
			}
			default:
			{
				element.update(value);
				return;
			}
		}

		if (revalidate)
		{
		    Appcelerator.Compiler.executeFunction(element,revalidate);
		}
	}
};
Appcelerator.Compiler.registerCustomAction('clear',ResetAction);
Appcelerator.Compiler.registerCustomAction('reset',ResetAction);

var ResetFormAction =
{
	execute: function(id,action,params)
	{
		var target = Appcelerator.Compiler.findParameter(params,'id') || id;
		var element = $(target);
		var code = null;
		var form = null;

		switch (Appcelerator.Compiler.getTagname(element))
		{
			case 'form':
			{
			    $(target).reset();
				break;
			}
			case 'input':
			case 'select':
			case 'textarea':
			default:
			{
			    $(target).form.reset();
				break;
			}
		}
	}
};
Appcelerator.Compiler.registerCustomAction('clearform',ResetFormAction);

Appcelerator.Compiler.registerCustomAction('value',
{
	metadata:
    {
        requiresParameters: true,
		requiredParameterKeys: ['value'],
		optionalParameterKeys: ['text','append','id','property'],
		description: "Sets the value of the current element with data from the message payload"
    },
	parseParameters: function (id,action,params)
	{
		return params;
	},
	execute: function(id,action,parameters,scope)
	{
		var targetId = id;
		var idFound = false;
		var valueHtml = null;
		var params = parameters;
		var append = false;
		var valueExpr = parameters;
		var form = false;
		
		if (parameters.charAt(0)=='"' || parameters.charAt(0)=="'")
		{
			valueHtml = parameters.substr(1, parameters.length - 2);
		}
		else
		{
			params = Appcelerator.Compiler.getParameters(parameters,false);
			
			for (var c=0,len=params.length;c<len;c++)
			{
				var param = params[c];
				// alert('value = '+Object.toJSON(param));
				if (param.empty)
				{
					// if empty, must be a standalone value
					if (param.keyExpression || param.valueExpression)
					{
						valueHtml = Appcelerator.Compiler.getEvaluatedValue(param.value,scope.data,scope,param.keyExpression||param.valueExpression);
					}
					else
					{
						valueHtml = Appcelerator.Compiler.getEvaluatedValue(param.key||param.value,scope.data,scope,param.keyExpression||param.valueExpression);
					}
				}
				else 
				{
					switch(param.key)
					{
						case 'id':
						{
							targetId = Appcelerator.Compiler.getEvaluatedValue(param.value,scope.data,scope,param.valueExpression);
							idFound = true;
							break;
						}
						case 'append':
						{
							append=true;
							break;
						}
						case 'value':
						{
							valueHtml = Appcelerator.Compiler.getEvaluatedValue(param.value,scope.data,scope,param.valueExpression);
							break;
						}
					}
				}
			}
		}

		var element = $(id);
		var html = '';
		var variable = '';
		var expression = '';

		var revalidate = false;

		switch (Appcelerator.Compiler.getTagname(element))
		{
			case 'input':
			{
				revalidate = true;
				var type = element.getAttribute('type') || 'text';
				switch (type)
				{
					case 'password':
					case 'hidden':
					case 'text':
					{
						variable='value';
						break;
					}
/*					case 'radio': TODO- fix me */
					case 'checkbox':
					{
						variable='checked';
						append=false;
						expression = "==true || " + valueHtml + "=='true'";
						break;
					}
					case 'button':
					case 'submit':
					{
						variable='value';
						break;
					}
				}
				break;
			}
			case 'textarea':
			{
				revalidate = true;
				variable = 'value';
				break;
			}
			case 'select':
			{
				// select is a special beast
				var code = '';
				var property = Appcelerator.Compiler.findParameter(params,'property');
				var row = Appcelerator.Compiler.findParameter(params,'row');
				var value = Appcelerator.Compiler.findParameter(params,'value');
				var text = Appcelerator.Compiler.findParameter(params,'text');
				if (!property) throw "required parameter named 'property' not found in value parameter list";
				if (!value) throw "required parameter named 'value' not found in value parameter list";
				if (!text) text = value;
				if (!append)
				{
				    element.options.length = 0;
				}
				var ar = Appcelerator.Compiler.generateSetter(property,scope);
				if (ar)
				{
				    for (var c=0;c<ar.length;c++)
				    {
				        if (row)
				        {
				            var rowData = Object.getNestedProperty(ar[c],row);
				        }
				        else
				        {
				            var rowData = ar[c];
				        }
				        if (rowData)
				        {
				            element.options[element.options.length] = new Option(Object.getNestedProperty(rowData, text), Object.getNestedProperty(rowData, value));
				        }
				    }
				}
                Appcelerator.Compiler.executeFunction(element,'revalidate');
				return;
			}
			case 'div':
			case 'span':
			case 'p':
			case 'a':
			case 'h1':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'td':
			case 'code':
			case 'li':
			case 'blockquote':
			{
				variable = 'innerHTML';
				break;
			}
			case 'img':
			case 'iframe':
			{
				append=false;
				variable = 'src';
				break;
			}
			case 'form':
			{
				//Guarantee that the form will not auto-submit when someone hits enter by adding 1 display:none text field
				var new_input_id = id+'_no_submit';
				if (!$(new_input_id)) 
				{
					var new_input = document.createElement('input');
					new_input.id = new_input_id;
					new_input.type = 'text';
					new_input.style.display = 'none';
					new_input.name = 'no_submit_guarantee';
					element.appendChild(new_input);
				}

				//Set form to true so we clear html var below -- we delegate to subsequent calls to handleCondition
				form = true;

				//e.g. value[bar]
				var elementAction = 'value['+parameters+']';
				//find the matching clause (in case the form has several actions in its on expression); e.g. r:foo
				var clause = this.findMatchingFormClause(element,elementAction);

				var descendants = element.descendants();
				
				for (var c = 0; c < descendants.length; c++)
				{
					var child = descendants[c];
					
					//need an id to handle the condition later and probably need one anyway so make sure it's there
					Appcelerator.Compiler.getAndEnsureId(child);
					var child_parameter;
					switch(Appcelerator.Compiler.getTagname(child))
					{
						 case 'select':
						 case 'textarea':
						 case 'input':
						 {
							  child_parameter = child.getAttribute('name') || child.id || ''
							  break;
						 }
						 default:
						 {
							  /**
							   * We don't look for an id as the value to read out on normal elements since divs, spans, etc.
							   * may have ids for styling, etc. but we do not want to overwrite text for labels etc.
							   * For divs, spans, etc. we require the name attribute if they are to be populated with data
							   * without their own explicit on expression (that is when the on expression is on a form tag).
							   */
							   child_parameter = child.getAttribute('name') || '';
						 }
					}
					
					if (child_parameter)
					{
						//e.g. value[bar.idx]
						var action = 'value['+parameters + '.' + child_parameter+']';
						Appcelerator.Compiler.handleCondition.call(this, [child,true,action,scope,null,null]);
					}
				}
				break;
			}
			default:
			{
				throw "syntax error: " + element.nodeName+' not supported for value action';
			}
		}

		if (!form)
		{
			if (append)
			{
			    var val = element[variable];
			    element[variable] = val + valueHtml + expression;
			}
			else
			{
			    element[variable] = valueHtml + expression;
			}
			if (revalidate)
			{
			    Appcelerator.Compiler.executeFunction(element, 'revalidate');
			}
		}
	},
	findMatchingFormClause: function(element, params)
	{
		//iterate over the clauses and find the appropriate clause to return
		//(the one with the appropriate action being handled by the cal for registerCustomAction('value'))
		var clauses = Appcelerator.Compiler.parseExpression(element.getAttribute('on'));

		for (var i = 0; i < clauses.length; i++)
		{
			var condition = clauses[i][2];
			if (condition == params)
			{
				return clauses[i];
			}
		}
		return [];
	}
});

Appcelerator.Compiler.registerCustomAction('bind',
{
	metadata:
    {
        requiresParameters: false,
		description: "Sets the value to all elements with the same fieldset to the data from the payload"
    },
	parseParameters: function (id,action,params,scope)
	{
		return params;
	},
	execute: function(id,action,parameters,scope)
	{
		var element = $(id);
		var fieldset = element.getAttribute('fieldset');

		if (!fieldset || fieldset == '')
		{
			throw "syntax error: element has no field set attribute "  + element;
		}

		var key = parameters;

		Appcelerator.Compiler.updateFieldsetValues(fieldset, scope.data, key);
	}
});

Appcelerator.Compiler.executeActionFunction = function(id,method,params,checkenabled,scope)
{
	var target = Appcelerator.Compiler.findParameter(params,'id') || id;
	if (checkenabled)
	{
	    try
	    {
	        var e = $(target);
	        if (e && !e.disabled && Element.showing(e))
	        {
	            Appcelerator.Compiler.executeFunction(target, method, [target, method, scope.data, scope.scope, scope.version, params, scope.direction, scope.type]);
	        }
	    }
	    catch (xxx_)
	    {
        }
	}
	else
	{
		scope = (!scope) ? {} : scope;
        Appcelerator.Compiler.executeFunction(target, method, [target, method, scope.data, scope.scope, scope.version, params, scope.direction, scope.type]);
	}
};

var GenericActionFunction = Class.create();
Object.extend(GenericActionFunction.prototype,
{
	initialize: function(check, widgetAction)
	{
		this.checkenabled = check;
		this.widgetAction = !!widgetAction;
	},
	execute: function(id,action,params,scope)
	{
        Appcelerator.Compiler.executeActionFunction(id,action,params,this.checkenabled,scope);
	}
});

Appcelerator.Compiler.GenericFunctions =
[
	['execute',false],
	['enable',false],
	['disable',false],
	['focus',true],
	['blur',true],
	['select',false],
	['selected',false],
	['unselect',false],
	['click',false],
	['submit',false]
];

for (var c=0,len=Appcelerator.Compiler.GenericFunctions.length;c<len;c++)
{
	var gf = Appcelerator.Compiler.GenericFunctions[c];
	var f = new GenericActionFunction(gf[1]);
	Appcelerator.Compiler.registerCustomAction(gf[0],f);
}

Appcelerator.Compiler.buildCustomAction = function (name)
{
	var action = Appcelerator.Compiler.customActions[name];

	if (!action)
	{
		var f = new GenericActionFunction(false, true);
		Appcelerator.Compiler.registerCustomAction(name,f);
	}
};

Appcelerator.Compiler.buildCustomElementAction = function (name, element, callback)
{
    var f = new GenericActionFunction(false, true);
    Appcelerator.Compiler.registerCustomAction(name, f, element);
    Appcelerator.Compiler.attachFunction(element.id, name, callback);
};
