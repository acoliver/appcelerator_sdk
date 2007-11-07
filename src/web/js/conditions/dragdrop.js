Appcelerator.Compiler.registerCustomCondition(function(element,condition,action,elseAction,delay,ifCond)
{
	var eventName = null;
	var code = '';

	switch (condition)
	{
		case 'dragstart':
		{
			eventName = 'onStart';
			break;
		}
		case 'drag':
		{
			eventName = 'onDrag';
			break;
		}
		case 'dragend':
		{
			eventName = 'onEnd';
			break;
		}
		case 'dragover':
		{
			if (!element.getAttribute('droppable'))
			{
				throw "dragover condition only applies to elements that have droppable attribute";
			}
			code += 'var element = $("'+element.id+'");';
			code += 'if (!element.hoverListeners)';
			code += '{';
			code += 'element.hoverListeners = [];';
			code += '}';
			code += 'var actionFunc = function(scope, data) {' + Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond) + '};';
			code += 'element.hoverListeners.push(';
			code += '{';
			code += 'onHover:function(e)';
			code += '{';
			code += 'Appcelerator.Compiler.executeAfter(actionFunc,'+String.stringValue(delay)+',{id:"'+element.id+'"});';
			code += '}';
			code += '});';
			return code;
		}
		case 'drop':
		{
			if (!element.getAttribute('droppable'))
			{
				throw "drop condition only applies to elements that have droppable attribute";
			}
			code += 'var element = $("'+element.id+'");';
			code += 'if (!element.dropListeners)';
			code += '{';
			code += 'element.dropListeners = [];';
			code += '}';
			code += 'var actionFunc = function(scope, data) {' + Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond) + '};';
			code += 'element.dropListeners.push(';
			code += '{';
			code += 'onDrop:function(e, dropped)';
			code += '{';
			code += 'Appcelerator.Compiler.executeAfter(actionFunc,'+String.stringValue(delay)+',{id:"'+element.id+'", dropped: dropped});';
			code += '}';
			code += '});';
			return code;
		}
	}
	
	if (eventName)
	{
		var id = element.id;
		code += 'var actionFunc = function(scope, data) { ' + Appcelerator.Compiler.makeConditionalAction(element.id,action,ifCond) + '};';
		code += 'var observer = {};';
		code += 'observer["'+eventName+'"] = function(type, draggable)';
		code += '{';
		code += 'if (draggable.element.id == "'+id+'")';
		code += '{';
		code += 'Appcelerator.Compiler.executeAfter(actionFunc,'+String.stringValue(delay)+',{id:"'+id+'"});';
		code += '}';		
		code += '};';
		code += 'Draggables.addObserver(observer);';
		return code;
	}
	
	return null;
});