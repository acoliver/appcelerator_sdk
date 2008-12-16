// 
// register our input fields listener
// 
Appcelerator.Compiler.registerAttributeProcessor(['textarea','input','select'],'validator',
{
	handle: function(element,attribute,value)
	{
		if (value && element.getAttribute('type')!='button')
		{
			// get the validator
			var validatorFunc = Appcelerator.Validator[value];
			if (!validatorFunc)
			{
				throw "syntax error: validator specified is not registered: "+value;
			}

			var validatorFunc = Appcelerator.Validator[value];
			var value = Appcelerator.Compiler.getInputFieldValue(element,true,true);
			element.validatorValid = validatorFunc(value, element) || false;
			
			// get the decorator
			var decoratorValue = element.getAttribute('decorator');
			var decorator = null, decoratorId = null;

			if (decoratorValue)
			{
				decorator = Appcelerator.Decorator[decoratorValue];
				if (!decorator)
				{
					throw "syntax error: decorator specified is not registered: "+decoratorValue;
				}
				decoratorId = decorator ? element.getAttribute('decoratorId') : null;
			}
						
			// optimize the revalidate by only running the validator/decorator logic after a period
			// of no changes for 100 ms - such that continous keystrokes won't continue
			// to cause revalidations -- or -- if we reach 10 keystrokes (which is arbitrary
			// but helps have more instant validation for longer values)
			var timer = null;
			var keystrokeCount = 0;
			var timerFunc = function()
			{
				keystrokeCount=0;
				Appcelerator.Compiler.executeFunction(element,'revalidate');
			};
			
			Appcelerator.Compiler.installChangeListener(element,function()
			{
				if (timer)
				{
					clearTimeout(timer);
					timer=null;
				}
				if (keystrokeCount++ < 10)
				{
					timer = setTimeout(timerFunc,100);
				}
				else
				{
					timerFunc();
				}
				return true;
			});
			
			var validationListeners = [];
			
			Appcelerator.Compiler.attachFunction(element,'revalidate',function()
			{
				// FIXME : this was needed for IE/Safari port but break firefox of course...				
				// if (!Element.showing(element))
				// {
				// 	return element.validatorValid;
				// }
				var value = Appcelerator.Compiler.getInputFieldValue(element,true,true);
				var valid = validatorFunc(value, element);
				var same = valid == element.validatorValid;
							
				element.validatorValid = valid;
				if (decorator)
				{
					decorator.apply(Appcelerator.Decorator,[element,element.validatorValid,decoratorId]);
				}
				if (!value)
				{
					Element.addClassName(element,'validator_empty');
					Element.removeClassName(element,'validator_value');
				}
				else
				{
					Element.addClassName(element,'validator_value');
					Element.removeClassName(element,'validator_empty');
				}
				if (valid)
				{
					Element.removeClassName(element,'validator_invalid');
					Element.addClassName(element,'validator_valid');
				}
				else
				{
					Element.removeClassName(element,'validator_valid');
					Element.addClassName(element,'validator_invalid');
				}
				if (same)
				{
					// if the same, don't refire events
					return valid;
				}
				if (validationListeners.length > 0)
				{
					for (var c=0,len=validationListeners.length;c<len;c++)
					{
						var listener = validationListeners[c];
						listener.apply(listener,[element,element.validatorValid]);
					}
				}
				return element.validatorValid;
			});
			
			Appcelerator.Compiler.attachFunction(element,'removeValidationListener',function(listener)
			{
				var idx = validationListeners.indexOf(listener);
				if (idx >= 0)
				{
					validationListeners.removeAt(idx);
				}
			});
			
			Appcelerator.Compiler.attachFunction(element,'addValidationListener',function(listener)
			{
				validationListeners.push(listener);
			});
			
			Appcelerator.Compiler.addTrash(element, function()
			{
			    Appcelerator.Compiler.removeChangeListener(element);
				validationListeners = null;
			});
			
			Appcelerator.Compiler.executeFunction(element,'revalidate');
		}
	}
});
