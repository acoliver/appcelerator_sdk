App.handleBasicEffect = function(obj, action, params)
{	
	// valid string options (i.e., not name-value pairs)
	var strOptions = ['speed','opacity','duration','easing'];
	
	// target element
	var target = obj;
	
	// string-based options
	var strValues = [];
	
	// object-based options
	var options = {};
	
	// track if action has options
	var hasOptions = false;

	for (var key in params)
	{
		var key = key
		var value = params[key]

		// capture alternate target if exists
		if (key == 'id')
		{
			target = $('#'+value);
		}
		
		// capture string-based paramters
		else if (strOptions.indexOf(key) != -1)
		{
			if (parseFloat(value) + '' == "NaN")
			{	
				strValues[strValues.length] = '"'+value+'"';
			}
			else
			{
				strValues[strValues.length] = value;
			}
		}
		// otherwise treat as Object
		else
		{
			options[key] = value;
			hasOptions = true;
		}
	}

	var args = null;
	
	// format arguments
	if (hasOptions == true)
	{
		args = []
		args.push (options);
		if (strValues.length>0) args.push (strValues);
	}
	else
	{
		args = strValues;
	}	
	
	// execute effect
	target[action].apply(target,args);
};

// basic effects list
var effects = ['show','hide','slideToggle','slideUp','slideDown','fadeIn','fadeOut','fadeTo','animate'];


// register effect handlers
$.each(effects,function()
{
	var name = $.string(this);
	var scope = this;
	App.regAction(new RegExp('^'+name+'(\\[(.*)?\\])?$'),function(params)
	{
		App.handleBasicEffect($(this),name,params)
	});
});



