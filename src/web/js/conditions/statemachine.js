
Appcelerator.Compiler.StateMachine = {};
Appcelerator.Compiler.StateMachine.APP_STATES = {};
Appcelerator.Compiler.StateMachine.CompiledStateConditionCache = {};

Appcelerator.Compiler.StateMachine.isStateCondition = function (token)
{
	return Appcelerator.Compiler.parameterRE.test(token);
};

Appcelerator.Compiler.registerCustomCondition(function(element,condition,action,elseAction,delay,ifCond)
{
	if (!Appcelerator.Compiler.StateMachine.isStateCondition(condition))
	{
		return false;
	}
	var id = element.id;
	
	//TODO: add not condition
	
	// statemachine[state] and statemachine[state]
	var tokens = condition.split(' ');
	var condition = '';
	var statemachines = [];
	var operator = null;
	
	for (var c=0,len=tokens.length;c<len;c++)
	{
		var token = tokens[c].trim();
		if (token.length == 0)
		{
			continue;
		}
		switch(token)
		{
			case 'and':
			{
				condition+=' && ';
				continue;
			}
			case '||':
			case '&&':
			{
				condition+=' '+token+' ';
				continue;
			}
			default:break;
		}
		
		var cond = '';
		
		if (token.charAt(0)=='!')
		{
			cond = '!';
			token = token.substring(1);
		}
		else if (token.startsWith('not '))
		{
			cond = '!';
			token = token.substring(4);
		}
		
		var actionParams = Appcelerator.Compiler.parameterRE.exec(token);
		var statemachine = actionParams[1];
		var state = actionParams[2];
		
		statemachines.push([statemachine,state]);
		condition += cond + 'Appcelerator.Compiler.StateMachine.isStateValid("'+statemachine+'","'+state+'")';
	}
	
	// pre-compile conditions
	var actionFunc = Appcelerator.Compiler.makeConditionalAction(id,action,ifCond);
	var elseActionFunc = (elseAction ? Appcelerator.Compiler.makeConditionalAction(id,elseAction,null) : null);
	var compiledCondition = Appcelerator.Compiler.StateMachine.CompiledStateConditionCache[condition];
	
	// if we didn't find it, cache it for re-use
	if (!compiledCondition)
	{
		compiledCondition = condition.toFunction();
		Appcelerator.Compiler.StateMachine.CompiledStateConditionCache[condition] = compiledCondition;
		$D('compiled state => '+condition);
	}

	var code = '';
	
	for (var c=0,len=statemachines.length;c<len;c++)
	{
		var statemachine = statemachines[c][0];
		var state = statemachines[c][1];

		$D('adding state change listener for '+statemachine+'['+state+']');
	
		Appcelerator.Compiler.StateMachine.registerStateListener(statemachine,function(statemachine,statechange,valid)
		{
			var result = compiledCondition();
			$D('statemachine: '+statemachine+'['+statechange+'] logic returned => '+result);

			if (result)
			{
				Appcelerator.Compiler.executeAfter(actionFunc,delay);
			}
			else if (elseActionFunc)
			{
				Appcelerator.Compiler.executeAfter(elseActionFunc,delay);
			}
		});
		Appcelerator.Compiler.StateMachine.addOnLoadStateCheck(statemachine);
	}

	return true;
});

//
// returns true if state machine is found or false if not registered
//
Appcelerator.Compiler.StateMachine.isStateMachine = function (machine)
{
	return Appcelerator.Compiler.StateMachine.APP_STATES[machine] != null;
};

//
// returns true if a state for machine is set
//
Appcelerator.Compiler.StateMachine.isStateValid = function (machine,state)
{
	var m = Appcelerator.Compiler.StateMachine.APP_STATES[machine];
	if (m)
	{
		if (m.active)
		{
			return (state == '*' || m.states['state_'+state]==true);
		}
	}
	return false;
};

//
// disable all states
//
Appcelerator.Compiler.StateMachine.disableStateMachine = function(statemachine)
{
	var state = Appcelerator.Compiler.StateMachine.getActiveState(statemachine,true);
	var m = Appcelerator.Compiler.StateMachine.APP_STATES[statemachine];
	if (m)
	{
		m.active=false;
		m.init=true;
		$D('disable state machine='+statemachine+'['+state+']');
		if (state)
		{
			Appcelerator.Compiler.StateMachine.fireStateMachineChange(statemachine,state,false);
		}
		m.activeState=state;
	}
}

//
// enable all states
//
Appcelerator.Compiler.StateMachine.enableStateMachine = function(statemachine)
{
	var m = Appcelerator.Compiler.StateMachine.APP_STATES[statemachine];
	if (m)
	{
		m.active=true;
		m.init=true;
		var state = m.activeState;
		$D('enable state machine='+statemachine+'['+state+']');
		if (state)
		{
			m.activeState = null;
			Appcelerator.Compiler.StateMachine.fireStateMachineChange(statemachine,state,true,true);
		}
	}
}

//
// add a state to a state machine 
//
Appcelerator.Compiler.StateMachine.addState = function (statemachine,state,on_off)
{
	var m = Appcelerator.Compiler.StateMachine.APP_STATES[statemachine];
	if (!m)
	{
		m = Appcelerator.Compiler.StateMachine.createStateMachine(statemachine);
	}
	m.states['state_'+state]=on_off;
};

//
// create a statemachine by id. warning: this method will
// not check for the existing of statemachine already created
// and will replace it if one already exists
// 
Appcelerator.Compiler.StateMachine.createStateMachine = function(statemachine)
{
	var m = {'states':{},'listeners':[], 'active':true, 'activeState':null, 'init':false};
	Appcelerator.Compiler.StateMachine.APP_STATES[statemachine] = m;
	return m;
};

//
// register a state machine listener for changes
//
Appcelerator.Compiler.StateMachine.registerStateListener = function (statemachine,listener)
{
	var m = Appcelerator.Compiler.StateMachine.APP_STATES[statemachine];
	if (!m)
	{
		m = Appcelerator.Compiler.StateMachine.createStateMachine(statemachine);
	}
	m.listeners.push(listener);
};

//
// unregister a listener
//
Appcelerator.Compiler.StateMachine.unregisterStateListener = function(statemachine,listener)
{
	var m = Appcelerator.Compiler.StateMachine.APP_STATES[statemachine];
	if (m)
	{
		var idx = m.indexOf(listener);
		if (idx >= 0)
		{
			m.removeAt(idx);
			return true;
		}
	}
	return false;
};

//
// given a statemachine, return the activate state name
//
Appcelerator.Compiler.StateMachine.getActiveState = function(statemachine,force)
{
	var m = Appcelerator.Compiler.StateMachine.APP_STATES[statemachine];
	if (m && (m.active || force==true))
	{
		if (m.activeState!=null) 
		{
			return m.activeState;
		}
		for (var s in m.states)
		{
			if (s.startsWith('state_'))
			{
				if (true == m.states[s])
				{
					return s.substring(6);
				}
			}
		}
	}
	return null;
};

//
// set the new state and de-activate other states and then 
// fire events to any listeners
//
Appcelerator.Compiler.StateMachine.fireStateMachineChange = function (statemachine,state,on_off,force,init)
{
	$D('fireStateMachineChange => '+statemachine+'['+state+'] = '+on_off+', force='+(force==true)+',init='+init);
	var m = Appcelerator.Compiler.StateMachine.APP_STATES[statemachine];
	if (m)
	{
		var different = false;
		
		for (var s in m.states)
		{
			if (s.startsWith('state_'))
			{
				if (state == s.substring(6))
				{
					var old = m.states[s];
					
					if (init==true || force==true || on_off == null || old==null || (old!=null && old!=on_off))
					{
						m.states[s] = on_off;
						m.activeState = on_off ? s.substring(6) : null;
						different = true;
						$D('setting '+statemachine+'['+state+']=>'+on_off+', current='+old+',m.activeState='+m.activeState);
					}
				}
				else if (on_off!=null && on_off==true)
				{
					// you can only have one state active
					m.states[s]=false;
					different=true;
					$D('setting '+statemachine+'['+s.substring(6)+']=>false');
				}
			}
		}
		
		$D('setting activeState = '+m.activeState+' for '+statemachine);
		
		m.init = true;
		
		// force potentially, check it
		different = force==true ? true : different ;
		
		//
		// now fire state change event to listeners
		// 
		if (different && m.listeners.length > 0)
		{
			for (var c=0,len=m.listeners.length;c<len;c++)
			{
				var listener = m.listeners[c];
				listener.apply(listener,[statemachine,state,on_off]);
			}
		}
	}
};

Appcelerator.Compiler.StateMachine.addOnLoadStateCheck = function (statemachine)
{
	if (Appcelerator.Compiler.StateMachine.initialStateInit)
	{
		if (Appcelerator.Compiler.StateMachine.initialStateInit.indexOf(statemachine) < 0)
		{
			Appcelerator.Compiler.StateMachine.initialStateInit.push(statemachine);	
		}
	}
};

Appcelerator.Compiler.StateMachine.resetOnStateListeners = function()
{
	if (!Appcelerator.Compiler.StateMachine.initialStateLoaders)
	{
		Appcelerator.Compiler.StateMachine.initialStateLoaders = [];
		Appcelerator.Compiler.StateMachine.initialStateInit = [];
	}
};

Appcelerator.Compiler.StateMachine.fireOnStateListeners = function()
{
	if (Appcelerator.Compiler.StateMachine.initialStateLoaders && Appcelerator.Compiler.StateMachine.initialStateLoaders.length > 0)
	{
		var statesFired = [];
		for(var c=0,len=Appcelerator.Compiler.StateMachine.initialStateLoaders.length;c<len;c++)
		{
			var entry = Appcelerator.Compiler.StateMachine.initialStateLoaders[c];
			$D('firing initial state change = '+entry[0]+'['+entry[1]+']');
			Appcelerator.Compiler.StateMachine.fireStateMachineChange(entry[0],entry[1],true,false,true);
			statesFired.push(entry[0]);
		}
		if (Appcelerator.Compiler.StateMachine.initialStateInit && Appcelerator.Compiler.StateMachine.initialStateInit.length > 0)
		{
			for (var c=0;c<Appcelerator.Compiler.StateMachine.initialStateInit.length;c++)
			{
				var statemachine = Appcelerator.Compiler.StateMachine.initialStateInit[c];
				if (statesFired.indexOf(statemachine) < 0)
				{
					var activeState = Appcelerator.Compiler.StateMachine.getActiveState(statemachine);
					if (activeState)
					{
						Appcelerator.Compiler.StateMachine.fireStateMachineChange(statemachine,activeState,true,true,false);
						statesFired.push(statemachine);
					}
				}
			}
		}
	}
	Appcelerator.Compiler.StateMachine.initialStateLoaders = null;
	Appcelerator.Compiler.StateMachine.initialStateInit = null;
};

Appcelerator.Compiler.StateMachine.re = /[\s\n\r]+or[\s\n\r]+/;
Appcelerator.Compiler.StateMachine.compileStateCondition = function (name,value)
{
	var state = 
	{
		'name':name,
		'states':{},
		'types':[]
	};

	if (value)
	{
		var tokens = value.split(Appcelerator.Compiler.StateMachine.re);

		for (var c=0,len=tokens.length;c<len;c++)
		{
			var token = tokens[c];
			var parts = Appcelerator.Compiler.parameterRE.exec(token);
			var type = Appcelerator.Compiler.convertMessageType(parts ? parts[1] : token);
			var params = parts ? parts[2] : null;
			var parameters = params ? Appcelerator.Compiler.getParameters(params,false) : null;
			var cond = parameters ? Appcelerator.Compiler.StateMachine.compileMessageConditionExpression(parameters) : null;
			var obj = state.states[type];
			if (!obj)
			{
				state.types.push(type);
				obj=[];
				state.states[type]=obj;
			}
			// add the condition (if we have one) or 
			// create an implicit condition that is always true
			obj.push(cond||'1==1');
		}
	}
	return state;
};

Appcelerator.Compiler.StateMachine.compileMessageConditionExpression = function(parameters)
{
	var code = '';
	for (var c=0,len=parameters.length;c<len;c++)
	{
		var parameter = parameters[c];
		var value = null;
		var condition = '==';
		var key = parameter.key;
		if (key.endsWith("!"))
		{
			condition='!=';
			key = key.substring(0,key.length-1);
		}
		switch(typeof(parameter.value))
		{
			case 'string':
			{
				value = '"'+parameter.value+'"';
				break;
			}
			case 'number':
			case 'boolean':
			{
				value = parameter.value;
				break;
			}
		}
		code+= 'Object.getNestedProperty(this.data,"'+key+'")' + condition + value;
		if (c + 1 < len)
		{
			code+=' && ';
		}
	}
	return code;
};

Appcelerator.Compiler.StateMachine.buildConditions = function(contexts)
{
	var byType = {};

	for (var c=0,len=contexts.length;c<len;c++)
	{
		var context = contexts[c];
		for (var x=0,xlen=context.types.length;x<xlen;x++)
		{
			var type = context.types[x];
			var obj = byType[type];
			if (!obj)
			{
				obj = [];
				obj.push('case "'+type+'": { ');
				byType[type]=obj;
			}
			var states = context.states[type];
			obj.push('if ('+states.join(' || ')+') return "' + context.name + '";');
		}
	}

	var code = [];
	var types = [];
	for (var type in byType)
	{
		types.push(type);
		var obj = byType[type];
		code.push(obj.join('') + 'break; } ');
	}

	return {
		types:types.uniq(),
		code:'switch(this.messagetype) { ' + code.join('') + ' default: return null; } '
	};
};

Appcelerator.Compiler.StateMachine.initialStateLoaders = [];
Appcelerator.Compiler.StateMachine.initialStateInit = [];

Appcelerator.Compiler.afterDocumentCompile(Appcelerator.Compiler.StateMachine.fireOnStateListeners);
