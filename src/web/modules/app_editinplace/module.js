
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
		var html = '<div id="'+element.id+'">';

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
		html += '</div>';

		var code = '';

		code += '{';
		
		code += 'var editinplace_input = $("'+id + '_editinplace_input");';
		code += 'var editinplace_text = $("'+id + '_editinplace_text");';
		code += 'var editinplace_buttons = $("'+id + '_editinplace_buttons");';
		code += 'var editinplace_savebutton = $("'+id + '_editinplace_savebutton");';
		code += 'var editinplace_cancelbutton = $("'+id + '_editinplace_cancelbutton");';
		code += 'var error_div = $("'+errorId+'");';

		code += '$("'+element.id+'").value = editinplace_text.innerHTML;';
		
		// attach convenience
		code += '$("'+element.id+'").field = editinplace_input;';
		
		code += 'var enterListener = function(e)';
		code += '{';
		code +=	'e = Event.getEvent(e);';
		code += 'var stop = false;';
		code += 'if (Event.isEnterKey(e))';
		code += '{';
		code += 'editinplace_savebutton.click();';
		code += '}';
		code += 'else if (Event.isEscapeKey(e))';
		code += '{';
		code += 'editinplace_cancelbutton.click();';
		code += '}';
		code += 'if (stop) Event.stop(e);';
		code += 'return !stop;';
		code += '};';

		code += 'var textClickListener = function(e)';
		code += '{';
		code += 'editinplace_text.style.display = "none";';
		code += 'editinplace_input.style.display = "";';
		code += 'editinplace_buttons.style.display = "";';
		code += 'editinplace_input.focus();';
		code += 'editinplace_input.select();';
		code += 'Appcelerator.Compiler.executeFunction(editinplace_input,"revalidate");';
		code += '};';
		
		code += 'var saveClickListener = function(e)';
		code += '{';
		code += 'editinplace_text.style.display = "";';
		code += 'editinplace_input.style.display = "none";';
		code += 'editinplace_buttons.style.display = "none";';
		code += 'editinplace_text.innerHTML = editinplace_input.value;';
		code += '$("'+element.id+'").value = editinplace_input.value;';
		code += '};';
		
		code += 'var cancelClickListener = function(e)';
		code += '{';
		code += 'editinplace_text.style.display = "";';
		code += 'editinplace_input.style.display = "none";';
		code += 'editinplace_buttons.style.display = "none";';
		code += 'editinplace_input.value = editinplace_text.innerHTML;';
		code += 'if (error_div.style.visibility!="hidden")';
		code += '{';
		code += 'error_div.style.visibility = "hidden";';
		code += '}';
		code += 'if (error_div.style.display!="none")';
		code += '{';
		code += 'error_div.style.display = "none";';
		code += '}';
		code += '};';
		
		code += 'Appcelerator.Compiler.attachFunction($("'+id+'"),"editmode",function(mode)';
		code += '{';
		code += 'switch(mode||"edit")';
		code += '{';
		code += 'case "edit":';
		code += '{';
		code += 'textClickListener();';
		code += 'break;';
		code += '}';
		code += 'case "save":';
		code += '{';
		code += 'saveClickListener();';
		code += 'break;';
		code += '}';
		code += 'case "cancel":';
		code += '{';
		code += 'cancelClickListener();';
		code += 'break;';
		code += '}';
		code += '}';
		code += '});';

		code += 'Event.observe(editinplace_input,"keypress",enterListener,false);';
		code += 'Event.observe(editinplace_text, "click", textClickListener, false);';
		code += 'Event.observe(editinplace_savebutton, "click", saveClickListener, false);';
		code += 'Event.observe(editinplace_cancelbutton, "click", cancelClickListener, false);';
		
		var message = element.getAttribute('message');
		if (message)
		{
			message = Appcelerator.Compiler.convertMessageType(message);
			code += 'var message="'+message+'";';
			code +=	'var property = '+String.stringValue(element.getAttribute("property"))+';';
			code += 'var listener = ';
			code +=	'{';
			code += 'accept: function()';
			code += '{';
			code += 'return [message];';
			code += '},';
			code += 'acceptScope: function(scope)';
			code += '{';
			code += 'return $("'+element.id+'").scope =="*" || scope == $("'+element.id+'").scope;';
			code += '},';
			code += 'onMessage: function (t, data, datatype, direction)';
			code += '{';
			code += 'try';
			code += '{';
			code += '$D("received message = "+direction+":"+t+",data="+Object.toJSON(data));';
			code += 'var value = property ? Object.getNestedProperty(data,property) : data;';
			code += 'switch ("'+type+'")';
			code += '{';
			code += 'case "text":';
			code += '{';
			code += 'editinplace_text.innerHTML = value;';
			code += 'editinplace_input.value = value;';
			code += 'break;';
			code += '}';
			code += '}';
			code += 'if (editinplace_input.revalidate) editinplace_input.revalidate();';
			code += '}';
			code += 'catch(e)';
			code += '{';
			code += 'Appcelerator.Compiler.handleElementException($("'+element.id+'"),e);';
			code += '}';
			code += '}';
			code += '};';
			
			code += 'Appcelerator.Util.ServiceBroker.addListener(listener);';
		}
		
		code += '}';
		
		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'initialization' : code,
			'wire' : true
		};
	}
};


Appcelerator.Core.registerModule('app:editinplace',Appcelerator.Module.EditinPlace);
Appcelerator.Core.loadModuleCSS('app:editinplace','editinplace.css');
