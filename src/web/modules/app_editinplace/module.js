
Appcelerator.Module.EditinPlace =
{
	getName: function()
	{
		return 'appcelerator editinplace';
	},
	getDescription: function()
	{
		return 'tabpanel editinplace';
	},
	setPath: function(path)
	{
		this.modulePath = path;
	},
	getVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Jeff Haynie';
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
		return 'app:editinplace';
	},
	execute: function(id,parameterMap,data,scope)
	{

	},
	compileWidget: function(params)
	{
		var id = params['id'];
		var element = $(id);
		
		var editinplace_input = $(id+'_editinplace_input');
		var editinplace_text = $(id+'_editinplace_text');
		var editinplace_buttons = $(id+'_editinplace_buttons');
		var editinplace_savebutton = $(id+'_editinplace_savebutton');
		var editinplace_cancelbutton = $(id+'_editinplace_cancelbutton');
		var error_div = $(id + '_error');
		
		element.value = editinplace_text.innerHTML;
		element.field = editinplace_input;
		
		var enterListener = function(e)
		{
			e = Event.getEvent(e);
			var stop = false;
			if (Event.isEnterKey(e))
			{
				editinplace_savebutton.click();
			}
			else if (Event.isEscapeKey(e))
			{
				editinplace_cancelbutton.click();
			}
			if (stop) Event.stop(e);
			return !stop;
		};

		var textClickListener = function(e)
		{
			editinplace_text.style.display = 'none';
			editinplace_input.style.display = '';
			editinplace_buttons.style.display = '';
			editinplace_input.focus();
			editinplace_input.select();
			Appcelerator.Compiler.executeFunction(editinplace_input,'revalidate');
		};

		var saveClickListener = function(e)
		{
			editinplace_text.style.display = '';
			editinplace_input.style.display = 'none';
			editinplace_text.innerHTML = editinplace_input.value;
			element.value = editinplace_input.value;
		}
		
		var cancelClickListener = function(e)
		{
			editinplace_text.style.display = '';
			editinplace_input.style.display = 'none';
			editinplace_buttons.style.display = 'none';
			editinplace_input.value = editinplace_text.innerHTML;
			if (error_div.style.visibility != 'hidden')
			{
				error_div.style.visibility = 'hidden';
			}
			if (error_div.style.display != 'none')
			{
				error_div.style.display = 'none';
			}
		};
		
		Event.observe(editinplace_input, 'keypress', enterListener,false);
		Event.observe(editinplace_text, 'click', textClickListener, false);
		Event.observe(editinplace_savebutton, 'click', saveClickListener, false);
		Event.observe(editinplace_cancelbutton, 'click', cancelClickListener, false);

		Appcelerator.Compiler.addTrash(element,function()
		{
			Event.stopObserving(editinplace_input, 'keypress', enterListener);
			Event.stopObserving(editinplace_text, 'click', textClickListener);
			Event.stopObserving(editinplace_savebutton, 'click', saveClickListener);
			Event.stopObserving(editinplace_cancelbutton, 'click', cancelClickListener);
		});

		var message = params['message'];
		if (message)
		{
			message = Appcelerator.Compiler.convertMessageType(message);
			var property = params['property'];
			var listener = 
			{
				accept: function()
				{
					return [message];
				},
				acceptScope: function(scope)
				{
					return element.scope=='*' || element.scope==scope;
				},
				onMessage: function (t, data, datatype, direction)
				{
					try
					{
						$D('received message = '+direction+':'+t+',data='+Object.toJSON(data));
						var value = property ? Object.getNestedProperty(data,property) : data;
						switch (params['type'])
						{
							case 'text':
							{
								editinplace_text.innerHTML = value;
								editinplace_input.value = value;
								break;
							}
						}
						if (editinplace_input.revalidate) editinplace_input.revalidate();
					}
					catch(e)
					{
						Appcelerator.Compiler.handleElementException(element,e);
					}
				}
			};

			Appcelerator.Util.ServiceBroker.addListener(listener);
		}		
	},
	buildWidget: function(element)
	{
		var type = element.getAttribute('type') || 'text';		
		var defaultClassName = element.getAttribute('defaultClassName') || '';		
		var editClassName = element.getAttribute('editClassName') || '';
		var buttonClassName = element.getAttribute('buttonClassName') || '';
		var saveOn = element.getAttribute('saveOn');
		var cancelOn = element.getAttribute('cancelOn');
		var validator = element.getAttribute('validator') || 'required';
		var position = element.getAttribute('position') || 'right';
		var errorPosition = element.getAttribute('errorPosition') || 'top';
		var defaultValue = element.getAttribute('defaultValue') || '';
		var errorIcon = Appcelerator.Module.EditinPlace.modulePath + 'images/bullet_error.png';	
		var errorMsg = element.getAttribute('errorMessage') || ' Required';
		var error = '<img src="' + errorIcon + '"/>' +  errorMsg;
		var errorClass = 'error_color small_text';
		var id = element.id;
		var html = '';

		for (var c=0,len=element.childNodes.length;c<len;c++)
		{
			var node = element.childNodes[c];
			if (node.nodeType == 1)
			{
				var langid = node.getAttribute('langid');
				switch (node.nodeName)
				{
					case 'ERROR':
					{
						errorClass = node.getAttribute('class') || errorClass;
						error = (langid) ? Appcelerator.Localization.get(langid,error) : Appcelerator.Compiler.getHtml(node);
						break;
					}
				}
			}
		}		
		
		var errorId = id + '_error';
		if (errorPosition=='top')
		{
			html += '<div class="'+errorClass+'" id="'+errorId+'" style="display:none">'+error+'</div>';
		}
		html += '<div>';
		switch (type)
		{
			case 'text':
			{
				editinplace_html = '<input class="'+editClassName+'" style="display:none" id="' + id + '_editinplace_input" '+(validator?'validator="'+validator+'"':'')+' decorator="custom" decoratorId="'+errorId+'" type="text" value="'+defaultValue+'"/>';
				editinplace_html += '<div style="cursor:pointer" class="'+defaultClassName+'" id="' + id + '_editinplace_text">' + defaultValue + '</div>';
				break;
			}
            case 'textarea':
            {
                editinplace_html = '<textarea class="'+editClassName+'" style="display:none" id="' + id + '_editinplace_input" '+(validator?'validator="'+validator+'"':'')+' decorator="custom" decoratorId="'+errorId+'">'+defaultValue+'</textarea>';
                editinplace_html += '<div style="cursor:pointer" class="'+defaultClassName+'" id="' + id + '_editinplace_text">' + defaultValue + '</div>';
                break;
            }
			default:
			{
				throw "unsupported field type: '" + type +"'";
			}
		}
		
		button_html = '<div id="' + id + '_editinplace_buttons" style="display:none;">';
		button_html += '<input activators="'+id+'_editinplace_input" class="'+buttonClassName+'" id="' + id + '_editinplace_savebutton" on="' + saveOn + '" type="button" value="Save">';
		button_html += '<input class="'+buttonClassName+'" id="' + id + '_editinplace_cancelbutton" on="' + cancelOn + '" type="button" value="Cancel">';
		button_html += '</div>';
		
		switch (position)
		{
			case 'right':
			{
				html += "<table><tr><td>" + editinplace_html + "</td><td>" + button_html + "</td></tr></table>";
				break;
			}
			case 'left':
			{
				html += "<table><tr><td>" + button_html + "</td><td>" + editinplace_html + "</td></tr></table>";
				break;
			}			
		    case 'bottom':
			{
				html += "<table><tr><td>" + editinplace_html + "</td></tr><tr><td>" + button_html + "</td></tr></table>";
				break;
			}
		    case 'top':
			{
				html += "<table><tr><td>" + button_html + "</td></tr><tr><td>" + editinplace_html + "</td></tr></table>";
				break;
			}
		}
		
		html += '</div>';
		if (errorPosition=='bottom')
		{
			html += '<div class="'+errorClass+'" id="'+errorId+'" style="display:none">'+error+'</div>';
		}
		
		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'initialization' : Appcelerator.Module.EditinPlace.compileWidget,
			'initializationParams' : {id: element.id, message: element.getAttribute('message'), property: element.getAttribute('property'), type: type},
			'wire' : true
		};
	}
};


Appcelerator.Core.registerModule('app:editinplace',Appcelerator.Module.EditinPlace);
Appcelerator.Core.loadModuleCSS('app:editinplace','editinplace.css');
