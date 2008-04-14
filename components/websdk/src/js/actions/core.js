Appcelerator.Compiler.registerCustomAction('show',
{
	build: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			return "Element.show('" + key + "')";
		}
		else
		{
			return "Element.show('" + id + "')";
		}
	}
});

Appcelerator.Compiler.registerCustomAction('hide',
{
	build: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			return "Element.hide('" + key + "')";
		}
		else
		{
			return "Element.hide('" + id + "')";
		}	
	}
});

Appcelerator.Compiler.registerCustomAction('visible',
{
	build: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			return "Element.setStyle('" + key + "',{visibility:'visible'})";
		}
		else
		{
			return "Element.setStyle('" + id + "',{visibility:'visible'})";
		}
	}
});

Appcelerator.Compiler.registerCustomAction('hidden',
{
	build: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			return "Element.setStyle('" + key + "',{visibility:'hidden'})";
		}
		else
		{
			return "Element.setStyle('" + id + "',{visibility:'hidden'})";
		}
	}
});

/** TODO: for effect extensibility, we need to provide a method like
 		 Appcelerator.Compiler.addEffect(function(element,options) {
 		 	// your code here
 		 });
 		 that also adds to this list and to the 'Effect' and 'Effect.Methods' objects
*/
Appcelerator.Compiler.effects = $w(
	'fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
	'pulsate shake puff squish switchOff dropOut morph highlight'
);

Appcelerator.Compiler.registerCustomAction('effect',
{
	metadata:
	{
		requiresParameters: true,
		shorthandParameters: true,
		optionalParameterKeys: Appcelerator.Compiler.effects,
	    description: "Invokes a Scriptaculous visual effect on this element"
	},
	
	build: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var options = '';
			var target=id

			// split first param to get effect name
			var arg1= params[0].key.split(",");
			var effectName = arg1[0];
			
			// get first option if exists
			if (arg1.length>1)
			{
				// if option is id, set target element for effect
				if (arg1[1] == "id")
				{
					target = params[0].value;
				}
				// otherwise, its an effect option
				else
				{
					options += arg1[1] + ":'" + params[0].value + "'";
					options += (params.length>1)?',':'';
				}
			}
			
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
					// otherwise, its an effect option
					else
					{						
						options += params[c].key + ":'" + params[c].value + "'";
						options += (c!=params.length-1)?',':'';
					}
				}
			}
		  	
			// format/validate effect name
			effectName = effectName.dasherize().camelize();
		  	effectName = effectName.charAt(0).toUpperCase() + effectName.substring(1);
			if (!Effect[effectName])
			{
				throw "syntax error: unsupported effect type: "+effectName;
			}
			
			return "Element.visualEffect('"+target+"','"+effectName+"',{"+options+"})";
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
		description: "Toggles a CSS property, or boolean attribute on this element"
	},
	build: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			var val = obj.value;
			var code = null;
			if (key == 'class')
			{
				code = 'if (Element.hasClassName("'+id+'","'+val+'")) Element.removeClassName("'+id+'","'+val+'"); else Element.addClassName("'+id+'","'+val+'")';
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
							code = 'var a = Element.getStyle("'+id+'","'+key+'"); if (a!="'+opposite+'") Element.setStyle("'+id+'",{"'+key+'":"'+opposite+'"}); else Element.setStyle("'+id+'",{"'+key+'":"'+val+'"})';
							break;
						}
						default:
						{
							code = 'var a = Element.getStyle("'+id+'","'+key+'"); if (a) Element.setStyle("'+id+'",{"'+key+'":""}); else Element.setStyle("'+id+'",{"'+key+'":"'+val+'"})';
							break;
						}
					}
				}
				else
				{
					code = 'var a = $("'+id+'"); if (!a) throw "no element with ID: '+id+'"; var v = a.getAttribute("'+key+'"); if (v) a.removeAttribute("'+key+'"); else a.setAttribute("'+key+'","'+val+'")';
				}
			}
			return code;
		}
		else
		{
			throw "syntax error: toggle action must have parameters";
		}
	}
});

Appcelerator.Compiler.generateSetter = function(value)
{
	return 'Appcelerator.Compiler.getEvaluatedValue("'+value+'",this.data||{})';
};

(function()
{
	var addsetBuildFunction = function(id,action,params)
	{
		if (params.length == 0)
		{
			throw "syntax error: expected parameter key:value for action: "+action;
		}
		var obj = params[0];
		var key = obj.key;
		var value = obj.value;
		if (Appcelerator.Compiler.isCSSAttribute(key))
		{
			key = Appcelerator.Compiler.convertCSSAttribute(key);
			return "Element.setStyle('" + id + "',{'" + key + "':" + Appcelerator.Compiler.generateSetter(value) + "})";				
		}
		else if (key == 'class')
		{
			if (action=='set')
			{
				return "$('" + id + "').className = " + Appcelerator.Compiler.generateSetter(value);
			}
			return "Element.addClassName('" + id + "'," + Appcelerator.Compiler.generateSetter(value)+")";
		}
		else
		{
			if (key.startsWith("style"))
			{
				return "$('"+id+"')."+key+ "=" + Appcelerator.Compiler.generateSetter(value);
			}
			
			var code = 'var e = $("'+id+'"); if (!e) throw "syntax error: element with ID: '+id+' doesn\'t exist";'
			code+= "var isOperaSetIframe =  " + Appcelerator.Browser.isOpera + " && e.nodeName=='IFRAME' && '"+key+"'=='src';";
            code+="if (e.nodeName=='IFRAME' && '"+key+"'=='src'){";
            code+="var onload=e.getAttribute('onloaded');";
            code+="if (onload){";
            code+="Appcelerator.Util.IFrame.monitor(e,function(){$MQ(onload,{},e.scope);});";
            code+="}";
            code+="}";
			code+='if (e["'+key+'"]!=null){';
			switch(key)
			{	
				case 'checked':
				case 'selected':
				case 'disabled':
					code+='e.'+key + " = ('true' == ''+" + Appcelerator.Compiler.generateSetter(value) + ')';
					break;
				default:
					code+='if(isOperaSetIframe) {e.location.href='+ Appcelerator.Compiler.generateSetter(value) + '; }';
					code+='else { e.' + key + " = " + Appcelerator.Compiler.generateSetter(value) + '; }'; 
			}
			code+='} else {';
			code+="e.setAttribute('"+key+"'," + Appcelerator.Compiler.generateSetter(value) + ")";
			code+='}';
			return code;
		}		
	}
	
    Appcelerator.Compiler.registerCustomAction('add',
	{
		metadata:
		{
			description: "Add a CSS property or attribute on this element"
		},
		build: addsetBuildFunction
	});
    Appcelerator.Compiler.registerCustomAction('set',
    {
        metadata:
        {
            description: "Set a CSS property or attribute on this element"
        },
        build: addsetBuildFunction
    });
})();

Appcelerator.Compiler.registerCustomAction('remove',
{
	build: function(id,action,params)
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
				return "Element.removeClassName('" + id + "'," + Appcelerator.Compiler.formatValue(value)+")";
			default:
				return "$('" + id + "').removeAttribute('"+key+"')";
		}
	}
});

Appcelerator.Compiler.registerCustomAction('statechange',
{
	metadata:
	{
		requiresParameters: true
	},
	build: function(id,action,params)
	{
		if (params.length == 0)
		{
			throw "syntax error: expected parameters in format 'statechange[statemachine=state]'";
		}
		
		var changes = params.map(function(obj)
		{
			var statemachine = obj.key;
			var state = obj.value;
			return 'Appcelerator.Compiler.StateMachine.fireStateMachineChange("'+statemachine+'","'+state+'",true,true,false)';
		});
		return changes.join(';');
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
	    build: function (id,action,params)
	    {
	        return params;
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

Appcelerator.Compiler.buildActionFunction = function(id,method,params,checkenabled)
{
	var target = Appcelerator.Compiler.findParameter(params,'id') || id;
	var prefix = '';
	var suffix = '';
	var customActionParams = Object.toJSON(params);
	if (checkenabled)
	{
		prefix='try{ var e=$("'+target+'"); if (e && !e.disabled && Element.showing(e)) ';
		suffix='}catch(xxx_){}';
	}

	return prefix + 'Appcelerator.Compiler.executeFunction("'+target+'","'+method+'",["'+target+'","'+method+'",this.data,this.scope,this.version,'+customActionParams+',this.direction,this.type])' + suffix;
};

Appcelerator.Compiler.registerCustomAction('selectOption',
{
	build: function(id,action,params)
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

		var code = 'var selectedValue = Object.getNestedProperty(this.data, "'+ key + '","'+def+'");';
		code += ' var targetSelect = $("'+id+'");';
		
		code += ' for (var j=0;j<targetSelect.options.length;j++)';
		code += ' {';
		code += '   if (targetSelect.options[j].value == selectedValue)';
		code += '   {';
		code += '      targetSelect.selectedIndex = j;';
		code += '      break;';
		code += '    }';
		code += '  }';
        code += 'Appcelerator.Compiler.executeFunction(targetSelect,"revalidate");';
        return code;		
	}
});

var ResetAction =
{
	build: function(id,action,params)
	{
		var target = Appcelerator.Compiler.findParameter(params,'id') || id;
		var element = $(target);
		var revalidate = false;
		var code = null;
		
		var elementHtml = '$("'+target+'")';
		var variable = '';
		var value = '""';
		
		switch (Appcelerator.Compiler.getTagname(element))
		{
			case 'input':
			case 'textarea':
			{
				variable = 'value';
				revalidate=true;
				break;
			}
			case 'select':
			{
				variable = 'selectedIndex';
				value = '0'; 
				revalidate=true;
				break;
			}
			case 'img':
			{
				variable = 'src';
				break;
			}
			case 'a':
			{
				variable = 'href';
				value = '#';
				break;
			}
			case 'form':
			{
				return 'Form.reset("'+target+'"); Form.Methods.getInputs("'+target+'").each(function(i){Appcelerator.Compiler.executeFunction(i,"revalidate");});';
			}
			default:
			{
				variable='innerHTML';
				code = elementHtml+".update(" + value + ")";
				break;
			}
		}
		
		if (!code)
		{
		    code = elementHtml + '.' + variable + '=' + value;
		}
		
		if (revalidate)
		{
			code+='; Appcelerator.Compiler.executeFunction(' + elementHtml +',"revalidate");'
		}
		
		return code;
	}
};
Appcelerator.Compiler.registerCustomAction('clear',ResetAction);
Appcelerator.Compiler.registerCustomAction('reset',ResetAction);

var ResetFormAction =
{
	build: function(id,action,params)
	{
		var target = Appcelerator.Compiler.findParameter(params,'id') || id;
		var element = $(target);
		var code = null;
		var form = null;
		
		switch (Appcelerator.Compiler.getTagname(element))
		{
			case 'form':
			{
				form='$("'+target+'")';
				break;
			}
			case 'input':
			case 'select':
			case 'textarea':
			default:
			{
				form='$("'+target+'").form';
				break;
			}
		}
		code = form+'.reset()';
		return code;
	}
};
Appcelerator.Compiler.registerCustomAction('clearform',ResetFormAction);

Appcelerator.Compiler.registerCustomAction('popup',
{
	re: /([+|-]{0,1})([0-9])+/,
	
	getPosition: function (value)
	{
		var obj = {value:"0",relative:true};
		var match = this.re.exec(value);
		if (match)
		{
			obj.relative=(match[1]=='+'||match[1]=='-');
			obj.value=value;
		}
		return obj;
	},
	build: function(id,action,params)
	{
		var target = id;
		
		var xOffset = "0", yOffset = "0";
		var xRelative = true, yRelative = true;
		var effect = "appear";
		
		if (params && params.length > 0)
		{
			var obj = params[0];
			
			if (params.length == 1)
			{
				if (obj.key == 'id')
				{
					target = obj.value;
				}
				else
				{
					target = obj.key;
				}
			}
			else
			{
				for (var c=0;c<params.length;c++)
				{
					var obj = params[c];
					switch (obj.key)
					{
						case 'id':
						{
							target = obj.value;
							break;
						}
						case 'x':
						{
							var pos = this.getPosition(obj.value);
							xOffset=pos.value;
							xRelative=pos.relative;
							break;
						}
						case 'y':
						{
							var pos = this.getPosition(obj.value);
							yOffset=pos.value;
							yRelative=pos.relative;
							break;
						}
						case 'effect':
						{
							effect = obj.value;
							break;
						}
					}
				}
			}
		}
		
		var code = 'var event = args[0]; var x = Event.pointerX(event); var y = Event.pointerY(event);'+
				   ((xRelative) ? "x+=" + xOffset : "x=" + xOffset) + ";" +
				   ((xRelative) ? "y+=" + yOffset : "y=" + yOffset) + ";" +
				   'Element.setStyle("'+target+'",{top:(y||0)+"px",left:(x||0)+"px"}); ' +
				   'setTimeout(function(){ Element.ensureVisible("'+target+'"); },50); ' +
				   ((!effect || effect=='') ? 'Element.show("'+target+'"); ' :  
				   'Element.visualEffect("'+target+'","'+effect+'"); ') ;
				
		return code;
	}
});


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
	build: function(id,action,parameters)
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
			valueHtml = parameters;
		}
		else
		{
			params = Appcelerator.Compiler.getParameters(parameters,false);

			for (var c=0,len=params.length;c<len;c++)
			{
				var param = params[c];
				if (params.length == 1 && null==param.value && param.key.charAt(0)=='$')
				{
					targetId = param.key;
					idFound=true;
				}
				else if (param.key == 'id')
				{
					if (param.value!=null)
					{
						targetId = param.value;
						idFound=true;
					}
					else
					{
						idFound=false;
					}
				}
				else if (param.key == 'append')
				{
					append = param.value==true || param.value=='true';
				}
				else if (param.key == 'value')
				{
					// this is a hack to allow multiple parameters and an expression
					if (param.value=='expr(')
					{
						var i = parameters.indexOf('expr(');
						var l = parameters.lastIndexOf(')');
						valueExpr = parameters.substring(i,l+1);
					}
					else
					{
						valueExpr = param.value;
					}
				}
			}
			var expressionMatch = Appcelerator.Compiler.expressionRE.exec(valueExpr);
			
			if (expressionMatch)
			{
				// allow them to specify exact javascript expression to run
				// that will set the value (analogous to onBindMessageExpr in 1.x)
				valueHtml = '(function(){ return ' + expressionMatch[1] + ' }).call(this);';
			}
			else if (params[0].key.charAt(0)=='$')
			{
				valueHtml = 'Appcelerator.Compiler.getElementValue($("'+params[0].key.substring(1)+'"))';
			}
			else
			{
				// assume its a property
				var key = params[0].key;
				// see if we have a default value in case key isn't found
				var def = params[0].value || key;
				if (def=='$null')
				{
					// default $null string is a special keyword to mean empty value
					def = '';
				}
				valueHtml = 'Object.getNestedProperty(this.data, "'+ key + '","'+def+'")';
			}
			if (valueHtml==null)
			{
				if (targetId.charAt(0)=='$')
				{
					targetId = targetId.substring(1);
				}
				var target = $(targetId);

				if (!target)
				{
					throw "syntax error: couldn't find target with ID: "+targetId+" for value action";
				}

				valueHtml = 'Appcelerator.Compiler.getElementValue($("'+targetId+'"))';
			}
		}
		
		var element = $(id);
		var html = '';
		var elementHtml = '$("'+id+'")';
		var variable = '';
		var expression = '';
		
		//TODO: select
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
				code = 'var ar = ' + Appcelerator.Compiler.generateSetter(property) + '; ';
				code+= 'var s = ' + elementHtml + ';';
				if (!append)
				{
					code+= 's.options.length = 0;';
				}
				code+= 'if (ar) {';
				code+= 'for (var c=0;c<ar.length;c++){';
				if (row)
				{
					code+= ' var row = Object.getNestedProperty(ar[c],"'+row+'");';
				}
				else
				{
					code+= ' var row = ar[c];';
				}
				code+= ' if (row){';
				code+= '  s.options[s.options.length] = new Option(Object.getNestedProperty(row,"'+text+'"),Object.getNestedProperty(row,"'+value+'"));';
				code+= ' }';
				code+= '}';
				code+= '}';
				code+= revalidate ? '; Appcelerator.Compiler.executeFunction(s,"revalidate");' : '';
				return code;
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
			{
				append=false;
				variable = 'src';
				break;
			}
			case 'form':
			{
				//Guarantee that the form will not auto-submit when someone hits enter by adding 1 display:none text field
				var new_input_id = id+'_no_submit';
				if (!$(new_input_id)) {
					var new_input = document.createElement('input');
					new_input.id = new_input_id;
					new_input.type = 'text';
					new_input.style.display = 'none';
					new_input.name = 'no_submit_guarantee';
					element.appendChild(new_input);					
				}

				//Set form to true so we clear html var below -- we deligate to subsequent calls to handleCondition
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
					var child_parameter = '';
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
								/*
								 * We don't look for an id as the value to read out on normal elements since divs, spans, etc.
								 * may have ids for styling, etc. but we do not want to overwrite text for labels etc.
								 * For divs, spans, etc. we require the name attribute if they are to be populated with data
								 * without their own explicit on expression (that is when the on expression is on a form tag).
							   */
								child_parameter = child.getAttribute('name') || '';
						 }
					}
					
					if (child_parameter != '') 
					{
						//e.g. value[bar.idx]
						var action = 'value['+parameters + '.' + child_parameter+']';						
						//the current child element is the one we want to handle the condition on
						clause[0] = child;
						//the condition to handle for this child element
						clause[2] = action;

						Appcelerator.Compiler.handleCondition.apply(this, clause);
					}
				}
				break;
			}
			default:
			{
				throw "syntax error: " + element.nodeName+' not supported for value action';
			}
		}
		
		var suffix = revalidate ? '; Appcelerator.Compiler.executeFunction(' + elementHtml +',"revalidate");' : '';
		
		$D('built expression=> '+ elementHtml + '.' + variable + '=' + valueHtml + expression + suffix);

		var html = '';
		if (!form)
		{
			if (append)
			{
				html = 'var value_' + element.id+' = ' + elementHtml + '.' + variable + ';'
				html += elementHtml + '.' + variable + ' = value_'+element.id+' + ' + valueHtml + expression;
			}
			else
			{
				html = elementHtml + '.' + variable + '=' + valueHtml + expression;
			}
			html += suffix;
		}
		return html;
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

var GenericActionFunction = Class.create();
Object.extend(GenericActionFunction.prototype,
{
	initialize: function(check, widgetAction)
	{
		this.checkenabled = check;
		this.widgetAction = !!widgetAction;
	},
	build: function(id,action,params)
	{
		return Appcelerator.Compiler.buildActionFunction(id,action,params,this.checkenabled);
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