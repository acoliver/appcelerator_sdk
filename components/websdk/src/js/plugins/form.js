var validators = {}, decorators = {}, fieldsets = {};
var validatorMonitor = null;
var validatorMonitors = null;
var validatorMonitorRate = 250;

AppC.setFieldMonitorInterval = function(rate)
{
	validatorMonitorRate = rate;
	if (validatorMonitor)
	{
		clearInterval(validatorMonitor);
		validatorMonitor = setInterval(fieldMonitor,validatorMonitorRate);
	}
}

AppC.addValidator = function(name,fn)
{
	validators[name]=fn;
};

AppC.getValidator = function(name)
{
	if (name)
	{
		return validators[name];
	}
}

AppC.addDecorator = function(name,fn)
{
	decorators[name]=fn;
};

App.getDecorator = function(name)
{
	if (name)
	{
		return decorators[name];
	}
}

AppC.addValidator('required',function(el,value)
{
	return (typeof(value)!='undefined' && value);
});

function installDecorator(el,target)
{
	if (!target)
	{
		var img = AppC.docRoot + 'images/exclamation.png';
		var id = el.attr('id') + '_decorator';
		var html = '<span id="'+id+'" class="decorator"><img src="' + img + '"/></span>';
		el.after(html);
		target = $('#'+id);
		el.data('decoratorTarget',target);
	}
	return target;
}

AppC.addDecorator('required',function(el,valid,value,target)
{
	target = installDecorator(el,target);
	
	if (valid)
	{
		el.css('background-color','');
		target.css('visibility','hidden');
	}
	else
	{
		el.css('background-color','#FFEEEE');
		target.css('visibility','visible');
	}
});

function fieldMonitor()
{
	if (validatorMonitors && validatorMonitors.length > 0)
	{
		$.each(validatorMonitors,function()
		{
			$(this).revalidate(true);
		});
	}
}

function startFieldMonitor(el)
{
	if (!validatorMonitors)
	{
		validatorMonitors = [];
		validatorMonitor = setInterval(fieldMonitor,validatorMonitorRate);
	}
	validatorMonitors.push(el);
	var fn = function()
	{
		stopFieldMonitor(el);
	};
	el.data('fieldMonitor',fn);
	el.bind('blur',fn);
}


function stopFieldMonitor(el)
{
	if (validatorMonitors)
	{
		var idx = validatorMonitors.indexOf(el);
		var idx = $.inArray(el,validatorMonitors);
		if (idx != -1)
		{
			validatorMonitors.splice(idx,1);
		}
		var fn = el.data('fieldMonitor');
		if (fn) el.unbind('blur',fn);
		el.removeData('fieldMonitor');
	}
}

function makeFormEntry(array,name,e,fn)
{
	$.each(array,function(idx)
	{
		var el = $(this);
		el.data(name,e);
		if (fn) fn(el);
		el.revalidate();
	});
	return array;
}

function fieldDecorate(el,valid,value)
{
	if (!value)
	{
		el.addClass('validator_empty').removeClass('validator_value');
	}
	else
	{
		el.removeClass('validator_empty').addClass('validator_value');
	}
	if (valid)
	{
		el.removeClass('validator_invalid').addClass('validator_valid');
	}
	else
	{
		el.addClass('validator_invalid').removeClass('validator_valid');
	}
	var dec = el.data('decorator');
	var target = el.data('decoratorTarget');
	var fn = typeof(dec)=='function' ? dec : App.getDecorator(dec);
	return fn ? fn(el,valid,value,target) : null;
}

function fieldActivate(el,activator,activators)
{
	activator = activator ? activator : el.data('activator');
	if (activator)
	{
		var valid = true;
		var array = activators ? activators : activator.data('activators');
		$.each(array,function()
		{
			var r = $('#'+this).data('validatorResult');
			if (r===false)
			{
				valid = false;
				return false;
			}
		});
		if (valid)
		{
			activator.removeAttr('disabled');
		}
		else
		{
			activator.attr('disabled',true);
		}
	}
}

function fieldRevalidate(el,changeOnly,ignoreActivate)
{
	var v = el.data('validator');
	if (v)
	{
		var result = false;
		var validator = typeof(v)=='function' ? v : AppC.getValidator(v);
		if (validator)
		{
			try
			{
				var value = getElementValue(el);
				if (changeOnly && el.data('validatorData')===value)
				{
					// ignore if the same and its a change only trigger
					return;
				}
				el.data('validatorData',value);
				result = validator(el,value);
				// turn it into a boolean and assume a result of undefined is the same as positive
				result = (typeof(result)=='undefined' ? true : result) ? true : false;
				el.data('validatorResult',result);
				fieldDecorate(el,result,value);
				if (!ignoreActivate) fieldActivate(el);
			}
			catch (E)
			{
				$.error("error in validation = "+E+" for element = "+el.attr('id'));
			}
		}
	}
	else
	{
		var activators = el.data('activators');
		if (activators)
		{
			fieldActivate(null,el,activators);
		}
	}
}

$.fn.revalidate = function(changeOnly)
{
	return $.each(this,function(idx)
	{
		fieldRevalidate($(this),changeOnly);
	});
	return this;
};

$.fn.validator = function(v)
{
	makeFormEntry(this,'validator',v,function(el)
	{
		if (el.is(':text,textarea'))
		{
			el.bind('focus',function()
			{
				startFieldMonitor(el);
			});
		}
		else if (el.is('select,:radio,:checkbox'))
		{
			el.bind('click',function()
			{
				el.revalidate();
			});
		}
	});
	return this;
};

$.fn.decorator = function(d,decId)
{
	var dec = decId ? (typeof(decId)=='string' ? $('#'+decId) : $(decId)) : null;
	var fn = dec ? function(el) { el.data('decoratorTarget', dec) } : null;
	return makeFormEntry(this,'decorator',d,fn);
};

$.fn.activators = function(a) 
{
	var self = this;
	var array = (typeof(a)=='string' ? a.split(/[ ,]/) : $.makeArray(a)).map(function(e){return $.trim(e)});
	this.data('activators',array);
	$.each(array,function(idx)
	{
		var el = $('#'+$.trim(this));
		if (!el)
		{
			$.error('Error adding activator field with id: '+this+', not found');
			return;
		}
		el.data('activator',self);
	});
	this.revalidate();
	return this;
};


$.fn.fieldset = function(fs)
{
	var array = (typeof(fs)=='string' ? fs.split(/[ ,]/) : $.makeArray(fs)).map(function(e){return $.trim(e)});
	$.each(this,function(idx)
	{
		var el = $(this);
		if (!el)
		{
			$.error('Error adding fieldset field with id: '+$(this).attr('id')+', not found');
			return;
		}
		el.data('fieldsets',array);
		$.each(array,function()
		{
			App.addToFieldset(el,$.trim(this));
		});
	});
};

App.addToFieldset = function(el,fs)
{
	var elements = fieldsets[fs];
	if (!elements)
	{
		elements = [];
		fieldsets[fs]=elements;
	}
	elements.push(el);
}

App.getFieldsetData = function(fs,obj)
{
	obj = obj || {};
	var array = typeof(fs)=='string' ? [fs] : fs.data('fieldsets');
	if (array && array.length > 0)
	{
		$.each(array,function()
		{
			var elements = fieldsets[this];
			if (elements)
			{
				$.each(elements,function()
				{
					var el = this;
					// we include if not a button
					if (!el.is(':button'))
					{
						var value = getElementValue(el);
						var key = el.is('form') ? el.attr('name') || el.attr('fieldset') || el.attr('id') : el.attr('name') || el.attr('id');
						obj[key]=value;
					}
				});
			}
		});
	}
	return obj;
};


App.reg('validator',['input','button','select','textarea'],function(value,state)
{
	$(this).validator(value);
});

App.reg('decorator',['input','button','select','textarea'],function(value,state)
{
	$(this).decorator(value,$(this).attr('decoratorId'));
});

App.reg('activators',['div','input','button'],function(value,state)
{
	$(this).activators(value);
});

App.reg('fieldset',['form','input','button','select','textarea'],function(value,state)
{
	$(this).fieldset(value);
});


//
// remap val function such that when it's called, it will always revalidate
// the field
//
var oldVal = $.fn.val;
$.fn.val = function()
{
	// we need to make sure that we don't 
	// call revalidate from an existing revalidate
	// in the call stack - which case we'll get into
	// an infinite loop... this just puts a guard in
	// to let us know that we're in this state
	var inr = this.data('revalidating');
	var rev = false;
	if (!inr)
	{
		rev=true;
		this.data('revalidating',true);
	}
	var r = oldVal.apply(this,arguments);
	if (rev)
	{
		this.revalidate();
		this.removeData('revalidating');
	}
	return r;
};
