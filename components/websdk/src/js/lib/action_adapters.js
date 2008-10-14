$.each(['add','remove'],function()
{
	var action = this;
	App.regAction(evtRegex(action),function(params,name)
	{
		var target = getTarget(params,this);

		for (var p in params)
		{
			switch(p)
			{
				case 'id':
				case 'event':
				{
					break;
				}
				default:
				{
					target[action](p,params[p]);
					break;
				}
			}
		}
		return this;
	});
});


App.regAction(evtRegex('cookie'),function(params)
{
	$.cookie(params.name,params.value,params);
});


App.regAction(evtRegex('disable'),function(params)
{
	return getTarget(params,this).disable();
});


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
			//position
			var position = target.css('position');
			if (position!='relative' && position!='absolute')
			{
				target.css('position','relative');
			}
			return target.animate(opts,speed,easing);
		}
		case 'fadeTo':
		{
			return target.fadeTo(target,[speed,opts.opacity||opts.to||1.0]);
		}
		default:
		{
			return target[action].apply(target,[speed]);
		}
	}
};


$.each(['show','hide','slideToggle','slideUp','slideDown','fadeIn','fadeOut','fadeTo','animate'],function()
{
	var name = $.string(this);
	App.regAction(evtRegex(name),function(params)
	{
		return App.handleBasicEffect(getTarget(params,this),name,params);
	});
});


App.regAction(evtRegex('enable'),function(params)
{
	return getTarget(params,this).enable();
});

regCSSAction('move',function(params)
{
	return getTarget(params,this).move(params);
});

$.each(['clear','reset','clearform'],function()
{
	var eventName = this;
	App.regAction(evtRegex(eventName),function(params,name,data)
	{
		return getTarget(params,this)[eventName]();
	});
});

$.each(['script','function','javascript'],function()
{
	var type = this;
	App.regAction(evtRegex(this),function(params,name,data)
	{
		return getTarget(params,this)[type](data,params);
	},true);
});

App.regAction(evtRegex('value'),function(params,name,data)
{
	return getTarget(params,this).value(params,data);
},true);


App.regAction(evtRegex('bind'),function(params)
{
	var target = getTarget(params,this);
	var fieldset = target.attr('fieldset');
	if (!fieldset)
	{
		$.error('bind action requires fieldset attribute');
		return this;
	}
	this.find('[fieldset='+fieldset+']').bind(params);
	return this;
});


App.regAction(evtRegex('scrollTo'),function(params)
{
	var scrollTo = 0;
	var duration = 1000;
	var scrollToObj = {};
	var useObj = false;
	var options = {};
	var target = null;
	
	for (var p in params)
	{
		switch(p)
		{
			case 'event':
			{
				break;
			}
			case 'id':
			{
				scrollTo = $('#' + params[p]);
				break;
			}
			case 'duration':
			{
				duration = parseInt(params[p]);
				break;
			}
			case 'axis':
			{
				options.axis = params[p];
				break;
			}
			case 'queue':
			{
				options.queue = params[p];
				break;
			}

			case 'top':
			{
				scrollToObj.top = params[p];
				useObj = true;
				break;
			}
			case 'left':
			{
				scrollToObj.left = params[p];
				useObj = true;
				break;
			}
			case 'target':
			{
				target = params[p];
				break;
			}
			default:
			{
				break;
			}
		}
	}
	if (target != null)
	{
		$('#'+target).scrollTo((useObj==true)?scrollToObj:scrollTo,duration,options);
	}
	else
	{
		$.scrollTo((useObj==true)?scrollToObj:scrollTo,duration,options);				
	}

});


App.regAction(evtRegex('set'),function()
{
	getTarget(params,this).set.apply(this,arguments);
	return this;
});


App.regAction(evtRegex('toggle'),function(params)
{
	return getTarget(params,this).toggle(params);
});

regCSSAction('highlight',function(params)
{
	var bgColor = params['background-color'] || params['backgroundColor'] || '#ffffcc';
	return getTarget(params,this).highlight(bgColor);
});
	

App.reg('on','*',function(value,state)
{
	$(this).on(value,state);
});



