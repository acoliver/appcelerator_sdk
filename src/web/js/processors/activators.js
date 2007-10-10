// 
// register our input button listener for handling
// activators
// 
Appcelerator.Compiler.registerAttributeProcessor('input','activators',
{
	handle: function(element,attribute,value)
	{
		if (value && element.getAttribute('type') == 'button')
		{
			// see if we're part of a field set and if so, add
			// our reference
			//
			var code = '';
			
			code += 'var fieldset = Appcelerator.Compiler.addFieldSet($("'+element.id+'"),true);';
			code += 'var fields = "'+value+'".split(",");';
			code += 'if (fields.length > 0)';
			code += '{';

			code += 'var activator = function()';
			code += '{';
			code += 'var valid = true;';
			code += 'for (var c=0,len=fields.length;c<len;c++)';
			code += '{';
			code += 'var field = $(fields[c]);';
		 	code += 'var fieldvalid = field.validatorValid;';
			code += 'if (!fieldvalid)';
			code += '{';
			code += 'valid = false;';
			code += 'break;';
			code += '}';
			code += '}';
			code += '$("'+element.id+'").disabled = !valid;';
			code += '};';
			
			code += 'for (var c=0,len=fields.length;c<len;c++)';
			code += '{';
			code += 'var fieldid = fields[c];';
			code += 'var field = $(fieldid);';
			code += 'if (!field)';
			code += '{';
			code += 'throw "syntax error: invalid field: "+fieldid+" specified for activator on field: "+"'+element.id+'";';
			code += '}';
			code += 'if (!Appcelerator.Compiler.getFunction(field,"addValidationListener"))';
			code += '{';
			code += 'throw "syntax error: non-validator field: "+fieldid+" specified for activator on field: "+"'+element.id+'";';
			code += '}';
			code += 'Appcelerator.Compiler.executeFunction(field,"addValidationListener",[activator]);';
			code += '}';
			
			code += 'activator();';
			
			code += '}';
			
			return code;
		}
	}
});