// 
// register our input button listener for handling
// activators
// 
Appcelerator.Compiler.registerAttributeProcessor(['div','input'],'activators',
{
	handle: function(element,attribute,value)
	{
		if (value && (element.nodeName == 'DIV' || element.getAttribute('type') == 'button'))
		{
			// see if we're part of a field set and if so, add
			// our reference
			//
			Appcelerator.Compiler.addFieldSet(element,true);
			var fields = value.split(',');
			if (fields.length > 0)
			{
				var activator = function()
				{
					var valid = true;
					for (var c=0,len=fields.length;c<len;c++)
					{
						var field = $(fields[c]);
					    var fieldvalid = field.validatorValid;
						if (!fieldvalid)
						{
							valid = false;
							break;
						}
					}  
					element.setAttribute('disabled',!valid);
					element.disabled = !valid;
				};
				for (var c=0,len=fields.length;c<len;c++)
				{
					var fieldid = fields[c];
					var field = $(fieldid);
					if (!field)
					{
						throw "syntax error: invalid field: "+fieldid+" specified for activator on field: "+element.id;
					}
					
					if (!Appcelerator.Compiler.getFunction(field,'addValidationListener'))
					{
						throw "syntax error: non-validator field: "+fieldid+" specified for activator on field: "+element.id;
					}
					Appcelerator.Compiler.executeFunction(field,'addValidationListener',[activator]);
				}
				
				activator();
			}
		}
	}
});