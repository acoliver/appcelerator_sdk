
Appcelerator.Module.Statemachine =
{
	getName: function()
	{
		return 'appcelerator statemachine';
	},
	getDescription: function()
	{
		return 'statemachine widget';
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
		return 'Jeff Haynie';
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
		return 'app:statemachine';
	},
	getAttributes: function()
	{
		return [{name: 'initial', optional: true, description: "Initial state of the state machine."}];
	},	
	buildWidget: function(element, parameters)
	{
		var initial = parameters['initial'];
		var initialFound = false;
		var id = element.id;
		
		if (!id)
		{
			throw "app:statemachine requires an ID attribute";
		}
		
		element.value = initial || '';
		
		var conditions = [];
		
		for (var c=0,len=element.childNodes.length;c<len;c++)	
		{
			var child = element.childNodes[c];
			if (child.nodeType == 1 && child.nodeName.toLowerCase() == 'state')
			{
				var name = child.getAttribute('name');
				var cond = child.getAttribute('if');
				
				if (initial && initial == name)
				{
					initialFound = true;
				}
				Appcelerator.Compiler.StateMachine.addState(id,name,null);
				
				conditions.push(Appcelerator.Compiler.StateMachine.compileStateCondition(name,cond));
			}
		}
		
		var compiled = Appcelerator.Compiler.StateMachine.buildConditions(conditions);
		
		if (initial)
		{
			if (!initialFound)
			{
				throw "invalid initial state - couldn't find state: "+initial+" for "+id;
			}
			//
			// go ahead and set the initial state
			// and invoke appropriate listeners 
			//
			element.value = initial;
			Appcelerator.Compiler.StateMachine.resetOnStateListeners();
			if (Appcelerator.Compiler.StateMachine.initialStateLoaders)
			{
				Appcelerator.Compiler.StateMachine.initialStateLoaders.push([id,initial]);
			}
		}

		// compile when first accessed
		var codeFunction = null;
		
		var listener =
		{
			accept: function()
			{
				return compiled.types;
			},
			acceptScope: function(scope)
			{
				return element.scope=='*' || scope==element.scope;
			},
			onMessage: function(type, data, datatype, direction)
			{
				try
				{
					if (!codeFunction)
					{
						codeFunction = compiled.code.toFunction();
						compiled = null;
					}
					
					var key = direction + ':' + type;
					var obj = {messagetype:key, type:type, datatype:datatype, direction:direction, data:data};
					var state = codeFunction.call(obj);
					
					if (state)
					{
						Appcelerator.Compiler.StateMachine.fireStateMachineChange(id,state,true);
					}
					else
					{
						state = Appcelerator.Compiler.StateMachine.getActiveState(id);
						
						if (state)
						{
							Appcelerator.Compiler.StateMachine.fireStateMachineChange(id,state,null);
						}
					}
				}
				catch (e)
				{
					Logger.error('Error processing message: '+direction+':'+type+' - '+Object.getExceptionDetail(e));
				}
			}
		};

		Appcelerator.Util.ServiceBroker.addListener(listener);

		var stateListener = function(statemachine,state,on_off)
		{
			if (on_off)
			{
				element.value = state;
			}
		};
		Appcelerator.Compiler.StateMachine.registerStateListener(id,stateListener);
		Appcelerator.Compiler.StateMachine.fireOnStateListeners();
		
		Appcelerator.Compiler.addTrash(element, function()
		{
			if (stateListener)
			{
				Appcelerator.Compiler.StateMachine.unregisterStateListener(stateListener);
				stateListener = null;
			}
			Appcelerator.Util.ServiceBroker.removeListener(listener);
		});
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : ''
		};
	}
};

Appcelerator.Core.registerModule('app:statemachine',Appcelerator.Module.Statemachine);