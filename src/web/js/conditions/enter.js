
Appcelerator.Compiler.registerCustomCondition(function(element,condition,action,elseAction,delay,ifCond)
{
	switch(condition)
	{
		case 'enter':
		case 'enter!':
		{
			if (Appcelerator.Compiler.getTagname(element)!='form')
			{
				throw "invalid condition: "+condition+" on element of type: "+element.tagName+", only supported on form elements";
			}
			var id = element.id;
			var code = '';
			code += 'var actionFunc_'+element.id+' = function (scope, data) {' + Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond,{id:id}) + '};';
			code += 'var action'+element.id+' = function(e)';
			code += '{';
			code += 'Appcelerator.Compiler.executeAfter(actionFunc_'+element.id+',"'+delay+'",{id:"'+id+'"});';
			if (condition == 'enter!')
			{
				code += 'Event.stop(Event.getEvent(e));';
			}
			code += '};'
			
			var inputs = Form.Methods.getInputs(element);
			for (var c=0;c<inputs.length;c++)
			{
				var input = inputs[c];
				var inputid = Appcelerator.Compiler.getAndEnsureId(input);
				code += 'Appcelerator.Util.KeyManager.installHandler(Appcelerator.Util.KeyManager.KEY_ENTER,$("'+inputid+'"),action'+element.id+');';
			}
			return code;
		}
	}
	return null;
});