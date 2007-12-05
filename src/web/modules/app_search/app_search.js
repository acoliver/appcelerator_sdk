Appcelerator.Module.Search =
{
	getName: function()
	{
		return 'appcelerator search';
	},
	getDescription: function()
	{
		return 'search widget';
	},
	getVersion: function()
	{
		return 1.0;
	},
	getSpecVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Hamed Hashemi';
	},
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'app:search';
	},
	getAttributes: function()
	{
		return [{name: 'request', optional: false, description: "Request message being sent to search"},
				{name: 'response', optional: false, description: "Response message for search results"},
				{name: 'selected', optional: false, description: "Message to be used when the user has selected an option"},				
				{name: 'key', optional: true, defaultValue: 'key', description: "Parameter name used in the request for the query"},
				{name: 'property', optional: true, defaultValue: 'result', description: "Property in the response used for the results"},
				{name: 'resultId', optional: true, defaultValue: 'id', description: "Property to use from the result to send selected message when using complex results"},
				{name: 'inputWidth', optional: true, defaultValue: '200', description: "Width of the input field"},
				{name: 'resultWidth', optional: true, defaultValue: '220', description: "Width of the results"},
				{name: 'delay', optional: true, defaultValue: 200, description: "Delay before firing request message"},
				{name: 'indicator', optional: true, description: "Indicator id to show or hide"},
				{name: 'activeClass', optional: true, defaultValue: 'search_result_active', description: "Active class for selecting search results"},
				{name: 'inactiveClass', optional: true, defaultValue: 'search_result_inactive', description: "Inactive class for selecting search results"}];
	},
	compileWidget: function(params)
	{
		var id = params['id'];
		var input = $(id);
		var request = params['request'];
		var response = params['response'];
		var selected = params['selected'];
		var elementScope = params['scope'];	
		var key = params['key'];
		var property = params['property'];
		var activeClass = params['activeClass'];
		var inactiveClass = params['inactiveClass'];
		var select = $(id+'_select');
		var resultId = params['resultId'];
		var delay = params['delay'];
		var indicator = params['indicator'];
		var compiled = null;
		
		if (params['template'])
		{
			compiled = eval(params['template'] + '; init_'+id);
		}

		var listener = 
		{
			accept: function()
			{
				return [response];
			},
			acceptScope: function(scope)
			{
				return elementScope == '*' || scope == elementScope;
			},
			onMessage: function(t, data, datatype, direction)
			{
				if (indicator)
				{
					Element.hide(indicator);
				}
				var value = property ? Object.getNestedProperty(data, property) : data;
				
				Appcelerator.Compiler.destroy(select);		
				
				while (select.hasChildNodes())
				{
					select.removeChild(select.firstChild);
				}
				
				var selectableData = [];
				
				for (var i = 0; i < value.length; i++)
				{
					(function(){
						var optionId = Appcelerator.Compiler.generateId();
						var optionValue = value[i];
						var optionCode = '<div id="'+optionId+'" style="width: 100%" class="search_result_inactive">';
						if (compiled)
						{
							for (idx in optionValue)
							{
								if (typeof optionValue[idx] == 'string')
								{
									optionValue[idx] = optionValue[idx].replace(/'/,'\u2019');
								}
							}
							optionCode += compiled(optionValue);							
						}
						else
						{
							optionCode += optionValue;
						}
						optionCode += '</div>';
						new Insertion.Bottom(select, optionCode);
						var option = $(optionId);
						option.onclick = function(event)
						{
							if (compiled)
							{
								$MQ(selected, {value: optionValue[resultId]});
							}
							else
							{
								$MQ(selected, {value: optionValue});
							}
						}
						option.onmouseover = function()
						{
							for (var i = 0; i < select.selectableData.length; i++)
							{
								Element.addClassName($(select.selectableData[i].id), inactiveClass);
								Element.removeClassName($(select.selectableData[i].id), activeClass);							
							}
							Element.removeClassName(this, inactiveClass);
							Element.addClassName(this, activeClass);
						};
						option.onmouseout = function()
						{
							Element.addClassName(this, inactiveClass);
							Element.removeClassName(this, activeClass);							
						};
						selectableData.push({id: optionId, value: optionValue});
					})();
				}
				
				select.selectedIndex = -1;
				select.selectableData = selectableData;
				
				Appcelerator.Compiler.dynamicCompile(select);
				
				if (select.selectableData.length > 0)
				{
					Element.show(id+'_results');
				}
			}
		};
		Appcelerator.Util.ServiceBroker.addListener(listener);
		
		var selectFunction = function()
		{
			(function(){
				if (select.selectedIndex >= 0)
				{
					var selected = select.selectableData[select.selectedIndex];
					if (selected)
					{
						if (!compiled)
						{
							input.value = selected.value;
						}

						for (var i = 0; i < select.selectableData.length; i++)
						{
							Element.addClassName($(select.selectableData[i].id), inactiveClass);
							Element.removeClassName($(select.selectableData[i].id), activeClass);							
						}
						Element.removeClassName($(selected.id), inactiveClass);							
						Element.addClassName($(selected.id), activeClass);
					}
				}
				else
				{
					for (var i = 0; i < select.selectableData.length; i++)
					{
						Element.addClassName($(select.selectableData[i].id), inactiveClass);
						Element.removeClassName($(select.selectableData[i].id), activeClass);
					}
				}
			})();
		};
		
		var timer = null;
		var keystrokeCount = 0;
		var timerFunc = function()
		{
			if (indicator)
			{
				Element.show(indicator);
			}
			
			keystrokeCount = 0;
			var payload = {};
			payload[key] = input.value; 
			$MQ(request, payload);
		};
		
		input.onkeydown = function (event)
		{
			(function(){
				event = event || window.event;
			
				switch(event.keyCode) 
				{
					case Event.KEY_TAB:
					case Event.KEY_LEFT:
					case Event.KEY_RIGHT:
					case Event.KEY_ESC:
					{
						Element.hide(id+'_results');
						Event.stop(event);
						return;
					}
					case Event.KEY_RETURN:
					{
						Element.hide(id+'_results');
						if (select.selectableData && select.selectedIndex >= 0)
						{
							if (compiled)
							{
								$MQ(selected, {value: select.selectableData[select.selectedIndex].value[resultId]});
							}
							else
							{
								$MQ(selected, {value: select.selectableData[select.selectedIndex].value});
							}
						}
						Event.stop(event);
						return;
					}
					case Event.KEY_UP:
					{
						if (select.selectableData && select.selectableData.length > 0)
						{
							Element.show(id+'_results');
							select.selectedIndex--;
							if (select.selectedIndex < 0)
							{
								select.selectedIndex = select.selectableData.length-1;
							}
							selectFunction();
						}
						Event.stop(event);
						return;
					}
					case Event.KEY_DOWN:
					{
						if (select.selectableData && select.selectableData.length > 0)
						{
							Element.show(id+'_results');
							select.selectedIndex++;
							if (select.selectedIndex > select.selectableData.length-1)
							{
								select.selectedIndex = 0;
							}
							selectFunction();
						}
						Event.stop(event);
						return;
					}
				}
			
				if (timer)
				{
					clearTimeout(timer);
					timer = null;
				}
				
				if (keystrokeCount++ < 10)
				{
					timer = setTimeout(timerFunc, delay);
				}
				else
				{
					timerFunc();
				}
				
				return true;
			})();
		};
		
		input.onblur = function (event)
		{
			setTimeout(function()
			{
				Element.hide(id+'_results');
			},100);
		}
		
		input.onfocus = function (event)
		{
			if (input.value.length > 0 && select.selectableData && select.selectableData.length > 0)
			{
				Element.show(id+'_results');
			}
		}
	},
	buildWidget: function(element,parameters)
	{
		parameters['scope'] = element.scope;
		
		if (element.innerHTML.strip().length > 0)
		{
			parameters['template'] = Appcelerator.Compiler.compileTemplate(Appcelerator.Compiler.getHtml(element),true,'init_'+element.id);		
		}
		
		var html = '<div style="position: relative">';
		html += '<table style="padding: 0; margin: 0" cellpadding="0" cellspacing="0"><tr><td><input type="text" id="'+element.id+'" style="width: '+parameters['inputWidth']+'px"/></td></tr>';
		html += '<tr><td><div style="display:none;z-index:2;position:absolute;" id="'+element.id+'_results" on="'+parameters['selected']+' then hide">';
		html += '<div id="'+element.id+'_select" style="width: '+parameters['resultWidth']+'px; border: 1px #000 solid; cursor: pointer;"></div></div></td></tr></table>';
		html += '</div>';
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : html,
			'wire' : true,
			'compile' : true
	   };
	}
};

Appcelerator.Core.registerModule('app:search',Appcelerator.Module.Search);
Appcelerator.Core.loadModuleCSS('app:search','search.css');