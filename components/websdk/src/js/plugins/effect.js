App.handleBasicEffect = function(obj, action, params)
{	
	// target element
	var target = obj;
	var opts = {}, speed = 0, easing=null;
	
	for (var p in params)
	{
		switch(p)
		{
			case 'event':
			{
				// from built-in events like click
				// and they aren't appropriate to pass in
				continue;
			}
			case 'id':
			{
				target = $('#'+params[p]);
				break;
			}
			case 'speed':
			{
				speed = params[p];
				break;
			}
			case 'easing':
			{
				easing = params[p];
				break;
			}
			default:
			{
				// must make camel properties like background-color read like backgroundColor
				opts[$.camel(p)]=params[p];
				break;
			}
		}
	}
	$.debug('effect='+action+',target='+target.attr('id')+',opts='+$.toJSON(opts)+',speed='+speed+',easing='+easing);
	switch (action)
	{
		case 'animate':
		{
			return target.animate(opts,speed,easing);
		}
		case 'fadeTo':
		{
			return target.fadeTo(speed,opts.opacity||opts.to||1.0);
		}
		default:
		{
			return target[action].apply(target,[speed]);
		}
	}
};

// basic effects list
var effects = ['show','hide','slideToggle','slideUp','slideDown','fadeIn','fadeOut','fadeTo','animate'];


// register effect handlers
$.each(effects,function()
{
	var name = $.string(this);
	App.regAction(evtRegex(name),function(params)
	{
		App.handleBasicEffect(this,name,params)
	});
});
