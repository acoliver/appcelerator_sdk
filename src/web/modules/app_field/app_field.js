
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
	getSpecVersion: function()
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
    getAttributes: function()
    {
        var T = Appcelerator.Types;
        return [{name: 'type', optional: true, defaultValue: 'text',
		         type: T.enumeration('text','password','autocomplete','select','dropdown')},
                {name: 'validator', optional: true},
                {name: 'fieldset', optional: true, type: T.fieldset},
                {name: 'fieldClassName', optional: true, defaultValue: 'field', type: T.cssClass},
                {name: 'activeClassName', optional: true, defaultValue: 'selected', type: T.cssClass},
                {name: 'inactiveClassName', optional: true, defaultValue: '', type: T.cssClass},
                {name: 'fieldActiveClassName', optional: true, defaultValue: '', type: T.cssClass},
                {name: 'fieldInactiveClassName', optional: true, defaultValue: '', type: T.cssClass},
                {name: 'fieldDefaultClassName', optional: true, defaultValue: '', type: T.cssClass},
				{name: 'fieldDefaultLangId', optional: true},
                {name: 'parameters', optional: true},
                {name: 'inline', optional: true, },
                {name: 'name', optional: true},
                {name: 'hash', optional: true},
                {name: 'langid', optional: true},
                {name: 'delay', optional: true, type: T.time},
                {name: 'autocomplete', optional: true, type: T.messageSend},
                {name: 'indicator', optional: true, type: T.elementId},
                {name: 'message', optional: true, type: T.messageReceive},
                {name: 'property', optional: true, type: T.identifier},
                {name: 'value', optional: true},
                {name: 'text', optional: true}];
    },
	compileWidget: function(params)
	{
		var id = params['id'];
		var type = params['type'];
		var fieldClass = params['fieldClass'];
		var fieldDefaultValueClass = params['fieldDefaultValueClass'];
		var fieldFocusClass = params['fieldFocusClass'];
		var focusClass = params['focusClass'];
		var blurClass = params['blurClass'];
		var fieldBlurClass = params['fieldBlurClass'];
		var defaultFieldValue = params['defaultFieldValue'];
		var validator = params['validator'];
		var errorId = id + '_error';
		var delay = params['delay'];
		var autocomplete = params['autocomplete'];
		var indicatorID = params['indicator'];
		var message = params['message'];
		var property = params['property'];
		var value = params['value'];
		var text = params['text'];
		var elementScope = params['scope'];
		var parameters = params['parameters'];
		
		var field = $(id);
		var container = $(id+'_field_container');
		
		if (fieldDefaultValueClass)
		{
			Element.addClassName(id, fieldDefaultValueClass);
		}
		if (fieldClass)
		{
			Element.addClassName(id, fieldClass);
		}
		
		var fieldGetter = function()
		{
			switch (type)
			{
				case 'text':
				case 'password':
				case 'autocomplete':
				{
					return field.value;
				}
				case 'select':
				case 'dropdown':
				{
					if (field.options.length == 0 || field.options.selectedIndex < 0)
					{
						return '';
					}
					return field.options[field.options.selectedIndex].text;
				}
			}
		};
		
		var fieldDefaultSetter = function(value)
		{
			switch (type)
			{
				case 'text':
				case 'password':
				case 'autocomplete':
				{
					field.value = value;
					break;
				}
			}
		};
		
		var focusListener = function()
		{
			if (fieldDefaultValueClass)
			{
				Element.removeClassName(field, fieldDefaultValueClass);
			}
			
			Element.addClassName(field, fieldFocusClass);
			Element.addClassName(container, focusClass);
			Element.removeClassName(field, fieldBlurClass);
			Element.removeClassName(field, blurClass);
			
			if (defaultFieldValue)
			{
				if (defaultFieldValue == fieldGetter())
				{
					fieldDefaultSetter('');
					if (field.revalidate)
					{
						field.revalidate();
					}
				}
			}
			return true;
		};

		var forceDecoration = function()
		{
			if (validator)
			{
				Appcelerator.Decorator['field_decorator'](field,'',errorId);
			}
		};
		
		var blurListener = function()
		{
			Element.addClassName(field, fieldBlurClass);
			Element.addClassName(container, blurClass);
			Element.removeClassName(field, fieldFocusClass);
			Element.removeClassName(container, focusClass);
			
			var value = fieldGetter();
			
			if (defaultFieldValue)
			{
				if (value == '')
				{
					Element.addClassName(field, fieldDefaultValueClass);
					fieldDefaultSetter(defaultFieldValue);
					// do it on a timeout to allow the main blur listener in
					// appcelerator to do its work and then come back in and force it
					setTimeout(forceDecoration, 100);
				}
			}
			else
			{
				Element.removeClassName(field, fieldDefaultValueClass);
			}
			
			field.value = value;
			return true;
		};
		
		Appcelerator.Compiler.attachFunction(field,'focus',function ()
		{
			field.focus();
		});

		Appcelerator.Compiler.attachFunction(field,'select',function ()
		{
			field.select();
		});

		Appcelerator.Compiler.attachFunction(field,'reset',function ()
		{
			switch (type)
			{
				case 'text':
				case 'password':
				case 'autocomplete':
				{
					field.value = '';
					break;
				}
				case 'select':
				case 'dropdown':
				{
					field.options.length = 0;
					break;
				}
			}
		});
		
		if (type == 'autocomplete')
		{
			var timer = null;
			var delay = Appcelerator.Util.DateTime.timeFormat(delay || '400ms');
			if (!autocomplete)
			{
				throw "autocomplete field types must have a 'autocomplete' attribute for the message to send";
			}
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
			
			var timer = null;
			var indicator = $(indicatorID);
			var stopAutoComplete = function()
			{
				if (timer)
				{
					clearTimeout(timer);
					timer = null;
				}
				
				return true;
			};
			
			var currentvaue = field.value;
			var autoComplete = function()
			{
				stopAutoComplete();
				currentvalue = field.value;
				if (indicator)
				{
					Element.setStyle(indicator,{visibility:'visible'});
				}
				var data = {};
				
				if (parameters)
				{
					data = Object.evalWithinScope(parameters, window);
				}
				
				data['id'] = id;
				data['value'] = field.value;
				$MQ(Appcelerator.Compiler.convertMessageType(autocomplete), data, elementScope);
				return true;
			};
			
			var keyListener = function(e)
			{
				stopAutoComplete();
				if (indicator)
				{
					Element.setStyle(indicator, {visibility:'hidden'});
				}
				
				timer = setTimeout(autoComplete, delay);
				return true;
			};
			
			Event.observe(field, 'keyup', keyListener, false);
			Event.observe(field, 'blur', stopAutoComplete, false);
		}
		
		Event.observe(field, 'focus', focusListener, false);
		Event.observe(field, 'blur', blurListener, false);
		
		if (message)
		{
			message = Appcelerator.Compiler.convertMessageType(message);
			if (!property)
				throw "field with message must also define PROPERTY attribute";
			
			// select case
			var textProperty = null;
			var valueProperty = null;
			if (type == "select" || type == "dropdown")
			{
				valueProperty = value;
				if (!valueProperty)
					throw "select field with message must also define a VALUE attribute";
				textProperty = text;
				if (!textProperty)
					textProperty = valueProperty;
			}
			
			$MQL(message,
				function(type, data, datatype, direction)
				{
					$D('received message = '+direction+':'+type+',data='+Object.toJSON(data));
					var value = property ? Object.getNestedProperty(data, property) : data;
					
					switch (type)
					{
						case 'text':
						case 'password':
						case 'autocomplete':
						{
							field.value = value;
							break;
						}
						case 'select':
						case 'dropdown':
						{
							if (typeof value == 'array' || (typeof value == 'object' && value.length))
							{
								field.options.length = 0;
								for (var c=0, len=value.length; c<len; c++)
								{
									var curRow = value[c];
									var newText = Object.getNestedProperty(curRow, textProperty);
									var newValue = Object.getNestedProperty(curRow, valueProperty);
									field.options[field.options.length] = new Option(newText, newValue);
								}
							}
							else
							{
								field.options.length = 0;
								field.options[0] = new Option(value, value);
							}
						}
					}
					
					if (field.revalidate)
					{
						field.revalidate();
					}
				},
				elementScope);		
		}
		
		forceDecoration();
	},
	buildWidget: function(element, parameters)
	{
		var type = parameters['type'];
		var validator = parameters['validator'];
		var fieldset = parameters['fieldset'];
		var id = element.id;
		var title = '';
		var description = '';
		var errorIcon = Appcelerator.Module.Field.modulePath + 'images/bullet_error.png';	
		var error = "<img src='" + errorIcon + "'/> Required";
		var html = '';
		var headerClass = 'medium_text info_color';
		var errorClass = 'error_color small_text';
		var footerClass = 'small_text info_color';
		var fieldClass = parameters['fieldClassName'];
		var focusClass = parameters['activeClassName'];
		var blurClass = parameters['inactiveClassName'];
		var fieldFocusClass = parameters['fieldActiveClassName'];
		var fieldBlurClass = parameters['fieldInactiveClassName'];
		var fieldDefaultValueClass = parameters['fieldDefaultClassName'];
		var fieldDefaultLangId = parameters['fieldDefaultLangId'];
		var defaultFieldValue = '';
		var footerOn = null, headerOn = null;
		var inline = parameters['inline'] == 'true';
		parameters['parameters'] = String.unescapeXML(parameters['parameters']);
		parameters['scope'] = element.scope;
		parameters['id'] = id;
		
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
              
		var name = parameters['name'];
		var namestr = name ? 'name="'+name+'"' : '';

		switch (type)
		{
			case 'text':
			case 'password':
			{
				if (!inline) html += '<div>';
				var add = (type=='password') ? parameters['hash'] : null;
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
				
				var langid = parameters['langid'];
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
		
		return {
			'presentation' : '<div class="field" id="'+ element.id + '_container">'+html+ '</div>',
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'compile' : true,
			'wire' : true			
		};
	}
};

Appcelerator.Core.registerModule('app:field',Appcelerator.Module.Field);
Appcelerator.Core.loadModuleCSS('app:field','field.css');

