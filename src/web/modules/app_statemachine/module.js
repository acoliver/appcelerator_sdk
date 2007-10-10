
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
	buildWidget: function(element)
	{
		var initial = element.getAttribute('initial');
		var initialFound = false;
		var id = element.id;
		
		if (!id)
		{
			throw "app:statemachine requires an ID attribute";
		}
		
		element.value = initial || '';
		
		var code = 'var conditions = [];';
		
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
					// set to null to indicate it hasn't been executed
					code += 'Appcelerator.Compiler.StateMachine.addState("'+id+'","'+name+'",null);';
				}
				else
				{
					code += 'Appcelerator.Compiler.StateMachine.addState("'+id+'","'+name+'",null);';					
				}
				
				code += 'conditions.push(Appcelerator.Compiler.StateMachine.compileStateCondition("'+name+'","'+cond+'"));';
			}
		}
		
		code += 'var compiled = Appcelerator.Compiler.StateMachine.buildConditions(conditions);'
		
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
			code += 'Appcelerator.Compiler.StateMachine.resetOnStateListeners();';
			code += 'if (Appcelerator.Compiler.StateMachine.initialStateLoaders)';
			code += '{';
			code += 'Appcelerator.Compiler.StateMachine.initialStateLoaders.push(["'+id+'","'+initial+'"]);';
			code += '};';
		}

		// compile when first accessed
		code += 'var codeFunction = null;';

		code += 'var listener = ';
		code += '{';
		code += 'accept: function()';
		code += '{';
		code += 'return compiled.types;';
		code += '},';
		code += 'acceptScope: function(scope)';
		code += '{';
		code += 'return "'+element.scope+'"=="*" || scope == "'+element.scope+'";';
		code += '},';
		code += 'onMessage: function (type, data, datatype, direction)';
		code += '{';
		code += 'try';
		code += '{';
		code += 'if (!codeFunction)';
		code += '{';
		code += 'codeFunction = compiled.code.toFunction();';
		code += 'compiled = null;';
		code += '}';
		code += 'var key = direction+":"+type;';
		code += 'var obj = {messagetype:key,type:type,datatype:datatype,direction:direction,data:data};';
		code += 'var state = codeFunction.call(obj);';
		code += 'if (state)';
		code += '{ Appcelerator.Compiler.StateMachine.fireStateMachineChange("'+id+'",state,true); }';
		code += 'else ';
		code += '{';
		code += 'state = Appcelerator.Compiler.StateMachine.getActiveState(id);';
		code += 'if (state)';
		code += '{ Appcelerator.Compiler.StateMachine.fireStateMachineChange("'+id+'",state,null); }';
		code += '}';
		code += '}';
		code += 'catch (e)';
		code += '{ Logger.error("Error processing message: "+direction+":"+type+" - "+Object.getExceptionDetail(e)); }';
		code += '}';
		code += '};';
		code += 'Appcelerator.Util.ServiceBroker.addListener(listener);';
		
		//
		// register a listener for our own statemachine changes so we can
		// set our widget value
		//
		code += 'var stateListener = function(statemachine,state,on_off)';
		code += '{';
		code += 'if (on_off)';
		code += '{';
		code += '$("'+id+'").value = state;';
		code += '}';
		code += '};';
		code += 'Appcelerator.Compiler.StateMachine.registerStateListener("'+id+'",stateListener);';
		
		code += 'Appcelerator.Compiler.StateMachine.fireOnStateListeners()';
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'initialization' : code
		};
	}
};

Appcelerator.Core.registerModule('app:statemachine',Appcelerator.Module.Statemachine);