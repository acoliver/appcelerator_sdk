
Appcelerator.Decorator['field_decorator'] = function(element, valid, decId)
{
	var field = $(decId);
	field.style.visibility = (valid) ? 'hidden' : 'visible';
};

Appcelerator.Module.Field =
{
	getName: function()
	{
		return 'appcelerator field';
	},
	getDescription: function()
	{
		return 'field widget';
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
		return 'app:field';
	},
	buildWidget: function(element)
	{
		var type = element.getAttribute('type') || 'text';
		var validator = element.getAttribute('validator');
		var fieldset = element.getAttribute('fieldset');
		var on = element.getAttribute('on');
		var id = element.id;
		var title = '';
		var description = '';
		var errorIcon = Appcelerator.Module.Field.modulePath + 'images/bullet_error.png';	
		var error = "<img src='" + errorIcon + "'/> Required";
		var html = '';
		var headerClass = 'medium_text info_color';
		var errorClass = 'error_color small_text';
		var footerClass = 'small_text info_color';
		var fieldClass = element.getAttribute('fieldClassName') || 'field'
		var focusClass = element.getAttribute('activeClassName') || 'selected';
		var blurClass = element.getAttribute('inactiveClassName') || '';
		var fieldFocusClass = element.getAttribute('fieldActiveClassName') || '';
		var fieldBlurClass = element.getAttribute('fieldInactiveClassName') || '';
		var fieldDefaultValueClass = element.getAttribute('fieldDefaultClassName') || '';
		var fieldDefaultLangId = element.getAttribute('fieldDefaultLangId');
		var defaultFieldValue = '';
		var footerOn = null, headerOn = null;
		var inline = element.getAttribute('inline');
		var parameters = String.unescapeXML(element.getAttribute('parameters'));
		
		if (fieldDefaultLangId)
		{
			defaultFieldValue = Appcelerator.Localization.get(fieldDefaultLangId,'');
		}
		
		if (Appcelerator.Browser.isIE)
		{
			// NOTE: in IE, you have to append with namespace
			var newhtml = element.innerHTML;
			newhtml = newhtml.replace(/<HEADER/g,'<APP:HEADER').replace(/\/HEADER>/g,'/APP:HEADER>');
			newhtml = newhtml.replace(/<FOOTER/g,'<APP:FOOTER').replace(/\/FOOTER>/g,'/APP:FOOTER>');
			newhtml = newhtml.replace(/<ERROR/g,'<APP:ERROR').replace(/\/ERROR>/g,'/APP:ERROR>');
			element.innerHTML = newhtml;
		}
		
		for (var c=0,len=element.childNodes.length;c<len;c++)
		{
			var node = element.childNodes[c];
			if (node.nodeType == 1)
			{
				var langid = node.getAttribute('langid');
				switch (node.nodeName)
				{
					case 'HEADER':
					{
						headerClass = ((Appcelerator.Browser.isIE) ? node.className : node.getAttribute('class')) || headerClass;
						headerOn = node.getAttribute('on');
						title = (langid) ? ('<span>' + Appcelerator.Localization.get(langid,'') + '</span>') : Appcelerator.Compiler.getHtml(node);
						break;
					}
					case 'FOOTER':
					{
						footerClass = ((Appcelerator.Browser.isIE) ? node.className : node.getAttribute('class')) || footerClass;
						footerOn = node.getAttribute('on');
						description = (langid) ? ('<span>' + Appcelerator.Localization.get(langid,'') + '</span>') : Appcelerator.Compiler.getHtml(node);
						break;
					}
					case 'ERROR':
					{
						errorClass = ((Appcelerator.Browser.isIE) ? node.className : node.getAttribute('class')) || errorClass;
						error = (langid) ? Appcelerator.Localization.get(langid,error) : Appcelerator.Compiler.getHtml(node);
						break;
					}
				}
			}
		}
		
		var errorId = id + '_error';
		
		var validatorText = validator ? 'validator="'+validator+'"' : '';
		var headerOnText = headerOn ? ' on="' + headerOn+'" ' : '';
		var footerOnText = footerOn ? ' on="' + footerOn+'" ' : '';
		
		if (!inline)
		{
		  html += '<div id="' + id + '_header" '+headerOnText+' class="'+headerClass+'">' + title  + ' <span class="'+errorClass+'" id="'+errorId+'" style="visibility:hidden">'+error+'</span></div>';
        }
              
		var name = element.getAttribute('name');
		var namestr = name ? 'name="'+name+'"' : '';

		switch (type)
		{
			case 'text':
			case 'password':
			{
				if (!inline) html += '<div>';
				var add = (type=='password') ? element.getAttribute('hash') : null;
				var addstr = add ? 'hash="'+add+'"' : '';
				html += '<input '+validatorText+' '+namestr+' '+addstr+' decorator="custom" decoratorId="'+errorId+'" type="'+type+'" value="'+defaultFieldValue+'" id="' + id + '" ' + (fieldset ? 'fieldset="' + fieldset + '"' : '') + '/>';
				break;
			}
            case 'textarea':
            {
                if (!inline) html += '<div>';
                html += '<textarea '+validatorText+' '+namestr+' '+addstr+' decorator="custom" decoratorId="'+errorId+'" id="' + id + '" ' + (fieldset ? 'fieldset="' + fieldset + '"' : '')+'>'+defaultFieldValue+'</textarea>';
                break;
            }
			case 'select':
			case 'dropdown':
			{
				if (!inline) html += '<div>';
				html += '<select '+validatorText+' '+namestr+' decorator="custom" decoratorId="'+errorId+'" id="' + id + '" ' + (fieldset ? 'fieldset="' + fieldset + '"' : '') ;
				
				var langid = element.getAttribute('langid');
				if (langid)
				{
					html+=' langid="' + langid + '" ';
				}
				html += '>';
				html += '</select>';
				break;
			}
			case 'autocomplete':
			{
				if (!inline) html += '<div>';
				html += '<input type="text" '+validatorText+''+namestr+' decorator="custom" decoratorId="'+errorId+'" value="'+defaultFieldValue+'" id="' + id + '" ' + (fieldset ? 'fieldset="' + fieldset + '"' : '') + '/>';
				break;
			}
			default:
			{
				throw "unsupported field type: '" + type + "'";
			}
		}
		if (!inline) 
		{
		  html += '</div>';
		  html += '<div id="' + id + '_footer" '+footerOnText+' class="'+footerClass+'">' + description + '</div>';
		}
        else
        {
          html += ' <span class="'+errorClass+'" id="'+errorId+'" style="visibility:hidden">'+error+'</span>';
        }		
		element.id = element.id+'_field';
		
		var field = $(id);
		
		if (fieldDefaultValueClass)
		{
			code+="Element.addClassName('"+id+"','"+fieldDefaultValueClass+"');";
		}
		if (fieldClass)
		{
			code+="Element.addClassName('"+id+"','"+fieldClass+"');";
		}
		/*
		if (on)
		{
			field.setAttribute('on',on);
		}*/
		
		//
		// map these so we can expose the true field to other widgets
		//
		element.field = field;
		// container.field = field;
		
		var code = '';
		code += 'var field = $("'+id+'");var container = $("'+element.id+'_container");';
		
		code += 'var fieldGetter = function()';		
		code += '{';
		switch(type)
		{
			case 'text':
			case 'password':
			case 'autocomplete':
				code += 'return field.value;';
			case 'select':
			case 'dropdown':
				code += 'if (field.options.length == 0 || field.options.selectedIndex < 0) return "";';
				code += 'return field.options[field.options.selectedIndex].text;';
		}
		code += '};';
		
		code += 'var fieldDefaultSetter = function(value)';
		code += '{';
		switch(type)
		{
			case 'text':
			case 'password':
			case 'autocomplete':
			{
				code += 'field.value = value;';
				break;
			}
			case 'select':
			case 'dropdown':
			{
				break;
			}
		}
		code += '};';
		
		code += 'var focusListener = function()';
		code += '{ ';
		if (fieldDefaultValueClass)
		{
			code += 'Element.removeClassName(field,"'+fieldDefaultValueClass+'");';
		}
		code += 'Element.addClassName(field,"'+fieldFocusClass+'");Element.addClassName(container,"'+focusClass+'");';
		code += 'Element.removeClassName(field,"'+fieldBlurClass+'");Element.removeClassName(container,"'+blurClass+'");';
		if (defaultFieldValue)
		{
			code += 'if ("'+defaultFieldValue+'" == fieldGetter())';
			code += '{';
			code += 'fieldDefaultSetter("");';
			code += 'if (field.revalidate) field.revalidate();';
			code += '}';
		}
		code += 'return true;';
		code += '};';
		
		code += 'var forceDecoration = function()';
		code += '{';
		if (validator)
		{
			code += 'Appcelerator.Decorator["field_decorator"](field,"","'+errorId+'");';
		}
		code += '};';
		
		code += 'var blurListener = function()';
		code += '{';
		code += 'Element.addClassName(field,"'+fieldBlurClass+'");Element.addClassName(container,"'+blurClass+'");';
		code += 'Element.removeClassName(field,"'+fieldFocusClass+'");Element.removeClassName(container,"'+focusClass+'");';
		code += 'var value = fieldGetter();';
		if (defaultFieldValue)
		{
			code += 'if (value=="")';
			code += '{';
			code += 'Element.addClassName(field,"'+fieldDefaultValueClass+'");';
			code += 'fieldDefaultSetter("'+defaultFieldValue+'");';
					// do it on a timeout to allow the main blur listener in
					// appcelerator to do its work and then come back in and force it
			code += 'setTimeout(forceDecoration,100);';
			code += '}';
		}
		else
		{
			code += 'Element.removeClassName(field,"'+fieldDefaultValueClass+'");';
		}
		code += 'field.value = value;';
		code += 'return true;';
		code += '};';
		
		code += 'Appcelerator.Compiler.attachFunction($("'+element.id+'"),"focus",function ()';
		code += '{';
		code += 'field.focus();';
		code += '});';
		
		code += 'Appcelerator.Compiler.attachFunction($("'+element.id+'"),"select",function ()';
		code += '{';
		code += 'field.select();';
		code += '});';
		
		code += 'Appcelerator.Compiler.attachFunction($("'+element.id+'"),"reset",function ()';
		code += '{';
		switch(type)
		{
			case 'text':
			case 'password':
			case 'autocomplete':
			{
				code += 'field.value = "";';
				break;
			}
			case 'select':
			case 'dropdown':
			{
	 			code += 'field.options.length = 0;';
				break;
			}
		}
		code += '});';
		
		if (type == 'autocomplete')
		{
			var timer = null;
			var delay = Appcelerator.Util.DateTime.timeFormat(element.getAttribute('delay') || '400ms');
			var autocomplete = element.getAttribute('autocomplete');
			if (!autocomplete)
			{
				if (!autocomplete)
				{
					throw "autocomplete field types must have a 'autocomplete' attribute for the message to send";
				}
			}
			var indicatorID = element.getAttribute('indicator');
			var indicator = null;
			if (indicatorID)
			{
				if (indicatorID=='footer')
				{
					indicator = $(id+'_footer');
					indicator.style.visibility='hidden';
				}
				else
				{
					indicator = $(indicatorID);
				}
				if (!indicator)
				{
					throw "autocomplete field couldn't find indicator with ID: "+indicatorID;
				}
			}
			
			code += 'var timer = null;';
			code += 'var indicator = $("'+indicatorID+'");';
			code += 'var stopAutoComplete = function()';
			code += '{';
			code += 'if (timer)';
			code += '{';
			code += 'clearTimeout(timer);';
			code += 'timer=null;';
			code += '}';
			code += 'return true;';
			code += '};';
			
			code += 'var currentvalue = field.value;';
			code += 'var autoComplete = function()';
			code += '{';
			code += 'stopAutoComplete();';
			code += 'currentvalue = field.value;';
			code += 'if (indicator)';
			code += '{';
			code += 'Element.setStyle(indicator,{visibility:"visible"});';
			code += '}';
			code += 'var data={};';
			if (parameters)
			{
				code += 'data = Object.evalWithinScope("'+parameters+'", window);';
			}
			code += 'data["id"]="'+id+'";';
			code += 'data["value"]=field.value;';
			code += '$MQ(Appcelerator.Compiler.convertMessageType("'+autocomplete+'"),data,field.scope);'
			code += 'return true;';
			code += '};';
			
			code += 'var keyListener = function(e)';
			code += '{';
			code += 'stopAutoComplete();';
			code += 'if (indicator)';
			code += '{';
			code += 'Element.setStyle(indicator,{visibility:"hidden"});';
			code += '}';
			code += 'timer = setTimeout(autoComplete,"'+delay+'");';
			code += 'return true;';
			code += '};';
			
			code += 'Event.observe(field,"keyup",keyListener,false);';
			code += 'Event.observe(field,"blur",stopAutoComplete,false);';
		}
		
		code += 'Event.observe(field,"focus",focusListener,false);';
		code += 'Event.observe(field,"blur",blurListener,false);';
		
		var message = element.getAttribute('message');
		if (message)
		{
			message = Appcelerator.Compiler.convertMessageType(message);
			var property = element.getAttribute('property');
			if (!property)
				throw "field with message must also define PROPERTY attribut";
			
			// select case
			var textProperty = null;
			var valueProperty = null;
			if (type == "select" || type == "dropdown")
			{
				valueProperty = element.getAttribute('value');
				if (!valueProperty)
					throw "select field with message must also define a VALUE attribute";
				textProperty = element.getAttribute('text');
				if (!textProperty)
					textProperty = valueProperty;
			}
			
			code += 'var message = "'+message+'";';
			code += 'var property = "'+property+'";';
			code += 'var textProperty = "'+textProperty+'";';
			code += 'var valueProperty = "'+valueProperty+'";';			
			code += 'var listener = ';
			code += '{';
			code += 'accept: function()';
			code += '{;';
			code += 'return [message];';
			code += '},';
			code += 'acceptScope: function(scope)';
			code += '{';
			code += 'return "'+element.scope+'" == "*" || scope == "'+element.scope+'";';
			code += '},';
			code += 'onMessage: function (t, data, datatype, direction)';
			code += '{';
			code += 'try';
			code += '{';
			code += '$D("received message = "+direction+":"+t+",data="+Object.toJSON(data));';
			code += 'var value = property ? Object.getNestedProperty(data,property) : data;';
			switch (type)
			{
				case 'text':
				case 'password':
				case 'autocomplete':
				{
					code += 'field.value = value;';
					break;
				}

				case 'select':
				case 'dropdown':
				{
					code += 'if (typeof value == "array" || (typeof value == "object" && value.length))';
					code += '{';
					code += 'field.options.length = 0;';
					code += 'for (var c=0,len=value.length;c<len;c++)';
					code += '{';
					code += 'var curRow = value[c];';
					code += ' var newText = Object.getNestedProperty(curRow,"'+textProperty+'");';
					code += ' var newValue = Object.getNestedProperty(curRow,"'+valueProperty+'");';
					code+= '  field.options[field.options.length] = new Option(newText,newValue);';
					code += '}';
					code += '}';
					code += 'else';
					code += '{';
					code += 'field.options.length = 0;';
					code += 'field.options[0]=new Option(value,value);';
					code += '}';
					break;
				}
			}
			code += 'if (field.revalidate) field.revalidate();';
			code += '}';
			code += 'catch(e)';
			code += '{';
			code += 'Appcelerator.Compiler.handleElementException($("'+element.id+'",e));';
 			code += '}';
			code += '}';
			code += '};';
			code += 'Appcelerator.Util.ServiceBroker.addListener(listener);';
		}
		
		code += 'forceDecoration();';
		
		return {
			'presentation' : '<div class="field" id="'+ element.id + '_container">'+html+ '</div>',
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'initialization' : code,
			'wire' : true
			
		};
	}
};

Appcelerator.Core.registerModule('app:field',Appcelerator.Module.Field);
Appcelerator.Core.loadModuleCSS('app:field','field.css');

