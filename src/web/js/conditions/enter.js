
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
			var actionFunc = Appcelerator.Compiler.makeConditionalAction(id,action,ifCond,{id:id});
			var action = function(e)
			{
				Appcelerator.Compiler.executeAfter(actionFunc,delay,{id:id});
				if (condition=='enter!')
				{
					Event.stop(Event.getEvent(e));
				}
			};
			
			var inputs = Form.Methods.getInputs(element);
			for (var c=0;c<inputs.length;c++)
			{
				var input = inputs[c];
				var inputid = Appcelerator.Compiler.getAndEnsureId(input);
				Appcelerator.Util.KeyManager.installHandler(Appcelerator.Util.KeyManager.KEY_ENTER,input,action);
				Appcelerator.Compiler.addTrash(input,function()
				{
					Appcelerator.Util.KeyManager.removeHandler(Appcelerator.Util.KeyManager.KEY_ENTER,input);
				});
			}
			return true;
		}
	}
	return false;
});