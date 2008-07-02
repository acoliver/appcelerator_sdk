Appcelerator.UI.registerUIComponent('type','select',
{
	//TODOS:
	// 1. figure out "value" versus "values" and change values and init
	// 2. support overloaded condition names (focus, change)
	// 3. add support for selectOption action
	
	// track initial options
	selectOptions: {},
	
	// current set of sorted options
	currentOptions: {},
	
	// track theme for each select
	activeThemes:{},
	
	// track vars for each select
	activeSelects:{},

	// select count number (decrements)
	selectCount: 1000,
	
	//change listeners'
	changeListeners: {},
	
	registerChangeListener: function(id,actionFunc,ifCond,delay)
	{
		this.changeListeners[id] = {'action':actionFunc,'ifcond':ifCond,'delay':delay};
	},
		
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'width', optional: true, description: "container width for select ",defaultValue: '100px'}
        ];
	},
	values:function(id,params,data,scope,version,attrs,direction,action)
	{
		// pull out properties
		var property = Appcelerator.Compiler.findParameter(attrs,'property');
		var row = Appcelerator.Compiler.findParameter(attrs,'row');
		var value = Appcelerator.Compiler.findParameter(attrs,'value');
		var text = Appcelerator.Compiler.findParameter(attrs,'text');
		if (!property) throw "required parameter named 'property' not found in value parameter list";
		if (!value) throw "required parameter named 'value' not found in value parameter list";
		if (!text) text = value;

		var values = [];
		var html = '';
		var dropdown = $(id + "_combo_box");
		var ar = Object.getNestedProperty(data, property)
		if (ar)
		{
			// loop through data
			dropdown.innerHTML = '';
		    for (var c=0;c<ar.length;c++)
		    {
		        if (row)
		        {
		            var rowData = Object.getNestedProperty(ar[c],row);
		        }
		        else
		        {
		            var rowData = ar[c];
		        }
		        if (rowData)
		        {
					html += '<div id="'+id+'_combo_'+c+'" class="select_'+Appcelerator.UI.ContainerManager.select.activeThemes[id]+'_dropdown_item" on="click then l:'+id+'_combo_value[value='+rowData.text+'] or mouseover then add[class=select_'+Appcelerator.UI.ContainerManager.select.activeThemes[id]+'_dropdown_hover] and l:'+id+'_combo_mouseover[row='+c+'] or mouseout then remove[class=select_'+Appcelerator.UI.ContainerManager.select.activeThemes[id]+'_dropdown_hover]">'+rowData.text+'</div>';
					values.push({'index':c,'id':id+'_combo_'+c,'value':rowData.value,'text':rowData.text});
		        }
		    }
		
			// reset dropdown values
			dropdown.innerHTML = html;
			
			// recompile
			Appcelerator.Compiler.destroy(dropdown);
			Appcelerator.Compiler.dynamicCompile(dropdown);
			
			// set tracking variables
			Appcelerator.UI.ContainerManager.select.selectOptions[id] = values;
			Appcelerator.UI.ContainerManager.select.currentOptions[id] = values;
			Appcelerator.UI.ContainerManager.select.activeSelects[id].selectedIndex=-1;
			Appcelerator.UI.ContainerManager.select.activeSelects[id].lastOption=ar.length - 1;

			// resize dropdown
			$(id+"_combo_box").style.height = Appcelerator.UI.ContainerManager.select._getDropdownHeight(ar.length);

		}

	},
	
	init:function(id,params,data,scope,version,attrs,direction,action)
	{
		Appcelerator.UI.ContainerManager.select.activeSelects[id].selectedIndex = 0;
		$MQ('l:'+id+'_combo_value',{'value':Appcelerator.UI.ContainerManager.select.currentOptions[id][Appcelerator.UI.ContainerManager.select.activeSelects[id].selectedIndex].text});
	
	},
	
	getActions: function()
	{
		return ['values','init'];
	},
	
	build: function(element,options)
	{	
		var theme = options['theme'];
		
		// build new select 
		var on = (element.getAttribute("on"))?'on="'+element.getAttribute("on")+'"':'';
		
		// record options
		var selectOptions = element.options;

		// record tracking variables		
		Appcelerator.UI.ContainerManager.select.activeThemes[element.id] = theme;
		Appcelerator.UI.ContainerManager.select.activeSelects[element.id] = {};
		Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex = -1;
		Appcelerator.UI.ContainerManager.select.activeSelects[element.id].lastOption = (element.options)?element.options.length-1:-1;
		
		// IE Z-index Hack 
		// reduce the container z-index for each select
		if (Appcelerator.Browser.isIE)
		{
			var html = '<span id="'+element.id+'"  class="select_'+theme+'" '+on+' style="z-index:'+	Appcelerator.UI.ContainerManager.select.selectCount+'">';
			Appcelerator.UI.ContainerManager.select.selectCount--;
		}
		else
		{
			var html = '<span id="'+element.id+'"  class="select_'+theme+'" '+on+'>';
		}
		html += '<span id="'+element.id+'_container" style="position:relative">';
		html += '<input style="width:'+options['width']+';" type="text" id="'+element.id+'_input" class="select_' + theme + '_input" on="l:'+element.id+'_combo_value then value[value] or click then l:'+element.id+'_combo_click"/>';
		html += '<img id="'+element.id+'_combo_img" src="images/blank_1x1.gif" class="select_' + theme + '_arrow" on="click then l:'+element.id+'_combo_click and focus[id='+element.id+'_input]"/>';
		html +='<div id="'+element.id+'_combo_box" on="l:'+element.id+'_combo_click then toggle[display]" style="display:none;width:'+options['width']+';" class="select_'+theme+'_dropdown">';
		html += Appcelerator.UI.ContainerManager.select._getOptions(element,theme);
		html += '</div></span></span>';
		new Insertion.Before(element,html);
		

		// track document clicks to trigger closing 
		// of the dropdown
		Event.observe(document,'click',function(ev)
		{
			ev = Event.getEvent(ev);
			var target = Event.element(ev);
			if (($(element.id + "_combo_box").style.display != "none") && (target.id !== element.id +"_combo_img"))
			{
				$MQ('l:'+element.id + '_combo_click');				
			}
			Event.stop(ev);
		});
	
		// create handle for input keystrokes
		$(element.id+"_input").onkeyup =  function (event)
		{
			(function(){
				event = event || window.event;

				switch(event.keyCode) 
				{
					// close dropdown
					case Event.KEY_TAB:
					case Event.KEY_LEFT:
					case Event.KEY_RIGHT:
					case Event.KEY_ESC:
					{
						$MQ('l:'+element.id + "_combo_click");
						Event.stop(event);
						return;
					}
					
					// select current value
					case Event.KEY_RETURN:
					{
						$MQ('l:'+element.id+'_combo_value',{'value':Appcelerator.UI.ContainerManager.select.currentOptions[element.id][Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex].text});
						$MQ('l:'+element.id + "_combo_click");
						Event.stop(event);
						return;
					}
					
					// update selected index and styles
					case Event.KEY_UP:
					{
						if (Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex > 0)
						{
							Element.removeClassName($(element.id+"_combo_" + Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex),'select_'+theme+'_dropdown_hover');
							Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex--;
							$MQ('l:'+element.id+'_combo_value',{'value':Appcelerator.UI.ContainerManager.select.currentOptions[element.id][Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex].text});
							Element.addClassName($(element.id+"_combo_" + Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex),'select_'+theme+'_dropdown_hover');							
						}
						Event.stop(event);
						return;
					}
					
					// update selected index and styles
					case Event.KEY_DOWN:
					{
						if (Appcelerator.UI.ContainerManager.select.activeSelects[element.id].lastOption != Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex)
						{
							Element.removeClassName($(element.id+"_combo_" + Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex),'select_'+theme+'_dropdown_hover');
							Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex++;
							$MQ('l:'+element.id+'_combo_value',{'value':Appcelerator.UI.ContainerManager.select.currentOptions[element.id][Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex].text});
							Element.addClassName($(element.id+"_combo_" + Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex),'select_'+theme+'_dropdown_hover');	
						}
						Event.stop(event);
						return;
					}
					
					// dynamically sort list based on current value
					default:
					{
						if ($(element.id + "_combo_box").style.display == "none")
						{
							$MQ("l:"+element.id + "_combo_click");
						}
						var values = Appcelerator.UI.ContainerManager.select.selectOptions[element.id];
						var options = [];
						for (var i=0;i<values.length;i++)
						{
							if (values[i].text.toLowerCase().startsWith($(element.id+"_input").value.toLowerCase()) == true)
							{
								options.push(values[i])
							}
						}
						
						// update tracking variables
						Appcelerator.UI.ContainerManager.select._updateOptions(element,options,theme);
						Appcelerator.UI.ContainerManager.select.currentOptions[element.id] = options;
						Appcelerator.UI.ContainerManager.select.activeSelects[element.id].lastOption = options.length -1;
						Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex = 0;

						// resize dropdown
						$(element.id+"_combo_box").style.height = Appcelerator.UI.ContainerManager.select._getDropdownHeight(options.length);
						
						Element.addClassName($(element.id+"_combo_0"),'select_'+theme+'_dropdown_hover');							
					}
				}
			})();
		};
		
		// add mouseover listener for dropdown
		$MQL('l:'+element.id+'_combo_mouseover', 
		function(t, data, datatype, direction)
		{
			if (data.row != Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex)
			{
				Element.removeClassName($(element.id+"_combo_" + Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex),'select_'+theme+'_dropdown_hover');			
				Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex = data.row;				
			}
		});

		// remove original element
		Appcelerator.Compiler.removeElementId(element.id);		
		Element.remove(element);
		
		// compile new element
		Appcelerator.Compiler.dynamicCompile($(element.id +"_container"));

		// setup "getValue" function for fieldsets
		$(element.id).widget = {};
		$(element.id).widget.getValue = function(id, parms)
		{
			return Appcelerator.UI.ContainerManager.select.currentOptions[id][Appcelerator.UI.ContainerManager.select.activeSelects[id].selectedIndex].value
		}


		// create condition listener for select condition
		$MQL('l:'+element.id+'_combo_value', 
		function(t, data, datatype, direction)
		{
			var entry = Appcelerator.UI.ContainerManager.select.changeListeners[element.id];
			if (entry)
			{
				var action = entry['action'];
				var delay = entry['delay'];
				var ifcond = entry['ifcond'];
				var actionFunc = Appcelerator.Compiler.makeConditionalAction(element.id,action,ifcond,{'value':Appcelerator.UI.ContainerManager.select.currentOptions[element.id][Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex].value});

				Appcelerator.Compiler.executeAfter(actionFunc,delay);
			}
		});
		
		// resize dropdown
		$(element.id+"_combo_box").style.height = Appcelerator.UI.ContainerManager.select._getDropdownHeight(selectOptions.length);


		// load select theme
		Appcelerator.Core.loadTheme('type','select',theme);	
	},
	
	// update options based on current text
	_updateOptions: function(element,options,theme)
	{
		var selectBox = $(element.id+"_combo_box");
		var html = '';
		for (var i=0;i<options.length;i++)
		{
			html += '<div id="'+element.id+'_combo_'+i+'" class="select_'+theme+'_dropdown_item" on="click then l:'+element.id+'_combo_value[value='+options[i].text+'] or mouseover then add[class=select_'+theme+'_dropdown_hover] and l:'+element.id+'_combo_mouseover[row='+i+'] or mouseout then remove[class=select_'+theme+'_dropdown_hover]">'+options[i].text+'</div>';
		}

		// update and recompile
		selectBox.innerHTML = html;
		Appcelerator.Compiler.destroy($(element.id+"_combo_box"));
		Appcelerator.Compiler.dynamicCompile(selectBox);

	},
	_getDropdownHeight: function(length)
	{
		if (length<20)
		{
			return (length *16) + "px";	
		}
		
	},
	
	// load initial options if specified
	_getOptions: function(element,theme)
	{
		if (element.options)
		{
			var html = '';
			var values = [];
			for (var i=0;i<element.options.length;i++)
			{
				html += '<div id="'+element.id+'_combo_'+i+'" class="select_'+theme+'_dropdown_item" on="click then l:'+element.id+'_combo_value[value='+element.options[i].text+'] or mouseover then add[class=select_'+theme+'_dropdown_hover] and l:'+element.id+'_combo_mouseover[row='+i+'] or mouseout then remove[class=select_'+theme+'_dropdown_hover]">'+element.options[i].text+'</div>';
				values.push({'index':i,'id':element.id+'_combo_'+i,'value':element.options[i].value,'text':element.options[i].text});
			}
			Appcelerator.UI.ContainerManager.select.selectOptions[element.id] = values;
			Appcelerator.UI.ContainerManager.select.currentOptions[element.id] = values;
			Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex = 0;
			$MQ('l:'+element.id+'_combo_value',{'value':Appcelerator.UI.ContainerManager.select.currentOptions[element.id][Appcelerator.UI.ContainerManager.select.activeSelects[element.id].selectedIndex].text});
			
			return html;
		}
		return '';
	}
});

// register custom conditions
Appcelerator.Compiler.registerCustomCondition(
{
	conditionNames: ['select'],
	description: "respond to change events for select"
},
function(element,condition,action,elseAction,delay,ifCond)
{
	Appcelerator.UI.ContainerManager.select.registerChangeListener(element.id,action,ifCond,delay);
	return true;
});
