
/**
 * stuff that goes in here will be available only if you load the 
 * appcelerator-compat.js file after appcelerator.js
 *
 */

//
// we instruct our jQuery selector patch to turn on and this
// will allow $('id') which Prototype supported in addition to the 
// newer css syntax: $('#id')
//
window.AppceleratorjQueryPatch = true;

Appcelerator = AppC;

//
// remap the prototype $$ (selector) to the jQuery $ 
// function
//
if (typeof($$)=='undefined')
{
	window.$$ = function(expr)
	{
		return jQuery(expr);
	};
}

// localization
// widgets
// get parameters
// browser
// download
// 

(function($)
{
	function el(id)
	{
		if (typeof(id)=='object')
		{
			return $(id);
		}
		if (typeof(id)=='string' && id.charAt(0)=='#')
		{
			return $(id);
		}
		switch(id)
		{
			case document.body:
			{
				return $('body');
			}
			case window:
			case 'window':
			{
				return $(window);
			}
			case document:
			case 'document':
			{
				return $(document);
			}
		}
		var e = $(id);
		// a DOM Element is returned from the 
		// jQuery selector patch in which case we need to
		// call $ again to get the jQuery wrapped version
		if (e && e.nodeType)
		{
			// now it will take the DOMElement and give it back
			// to use wrapped which we expect from this function
			return $(e);
		}
		return e;
	}
	function collect(el)
	{
		var a=[];
		$.each(el,function(idx)
		{
			a.push($(this).get(idx));
		});
		return a;
	}
	//
	// define a minilist port of prototype API for Element as 
	// long as we don't have Prototype loaded along side Appcelerator + jQuery
	//
	if (typeof(Prototype)=='undefined')
	{
		// Prototype mapping
		Prototype = 
		{
			Version:'1.6.0',
			K:function(x){return x},
			emptyFunction:function(){}
		};
		
		// Class mapping
		Class = $.Class;
		
		// Object mapping
		Object.extend = $.Class.extend;
		Object.toJSON = function(obj)
		{
			return $.toJSON(obj);
		};
		Object.inspect = function(obj)
		{
		    try {
		      if (object === undefined) return 'undefined';
		      if (object === null) return 'null';
		      return object.toString();
		    } catch (e) {
		      if (e instanceof RangeError) return '...';
		      throw e;
		    }
		};
		Object.isElement = function(object) 
		{
		    return object && object.nodeType == 1;
		};
		Object.isArray = function(object) 
		{
		    return object && typeof(object.splice) == 'function';
		};
		Object.isHash = function(object) 
		{
		    return false;
		};
		Object.isFunction = function(object) 
		{
		    return typeof object == "function";
		};
		Object.isString = function(object) 
		{
		    return typeof object == "string";
		};
		Object.isNumber = function(object) 
		{
		    return typeof object == "number";
		};
		Object.isUndefined = function(object) 
		{
		    return typeof object == "undefined";
		};
		$A = function(obj)
		{
			return $.makeArray(obj);
		}
		$H = function(obj)
		{
			return obj;
		};
		
		// String mapping
		Object.extend(String.prototype, 
		{
			gsub: function(pattern, replacement) 
			{
				return $.gsub(this,pattern,replacement);
			},
			strip: function()
			{
				return $.trim(this);
			},
			trim: function()
			{
				return $.trim(this);
			},
			startsWith: function(pattern)
			{
				return $.startsWith(this,pattern);
			},
		  	endsWith: function(pattern) 
			{
		    	var d = this.length - pattern.length;
		    	return d >= 0 && this.lastIndexOf(pattern) === d;
		  	},
			isJSON: function()
			{
				return $.isJSON(this);
			},
			evalJSON: function()
			{
				return $.evalJSON(this);
			},
			interpolate: function(object, pattern) 
			{
				return new Template(this,pattern).evaluate(object);
			},
			toFunction:function()
			{
				return $.toFunction(this);
			}
		});
		
		Object.extend(String,
		{
			unescapeXML: function(s)
			{
				return $.unescapeXML(s);
			},
			escapeXML: function(s)
			{
				return $.escapeXML(s);
			}
		});
		
		
		// Template mapping
		Template = function(template,pattern)
		{
			var t = AppC.compileTemplate(template,false,null,pattern);
			this.evaluate = function(obj)
			{
				return t(obj);
			};
		};
		
		// Function mapping
		Object.extend(Function.prototype, 
		{
			bind: function() 
			{
				if (arguments.length < 2 && arguments[0] === undefined) return this;
				var __method = this, args = $A(arguments), object = args.shift();
				return function() {
				 	return __method.apply(object, args.concat($A(arguments)));
				}
			},
			bindAsEventListener: function() 
			{
				var __method = this, args = $A(arguments), object = args.shift();
		 		return function(event) {
		   			return __method.apply(object, [event || window.event].concat(args));
		 		}
			},
		  	delay: function(f,t) {
		    	var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
		    	return window.setTimeout(function() {
		      		return __method.apply(__method, args);
		    	}, timeout);
		  	},
			defer: function()
			{
				return this.delay(0.01);
			}
		});
		
		// Element mapping
		Element = 
		{
			hasAttribute:function(a)
			{
				return el(id).attr(a) != null;
			},
			classNames:function(id)
			{
				var e = el(id);
				return new Element.ClassNames(e,e.attr('class'));
			},
			addClassName:function(id,name)
			{
				return el(id).addClass(name);
			},
			removeClassName:function(id,name)
			{
				return el(id).removeClass(name);
			},
			hasClassName:function(id,name)
			{
				return el(id).attr('class').split(' ').indexOf(name)!=-1;
			},
			toggleClassName:function(id,name)
			{
				var e = el(id);
				if (this.hasClassName(e,name))
				{
					return e.removeClass(name);
				}
				else
				{
					return e.addClass(name);
				}
			},
			cleanWhitespace:function(id)
			{
				el(id).contents('[nodeType=3]').remove();
				return this;
			},
			getStyle:function(id,style)
			{
				var value = el(id).css(style);
				if (style == 'opacity') return value ? parseFloat(value) : 1.0;
			    return value == 'auto' ? null : value;
			},
			setStyle:function(id,obj)
			{
				var e = el(id);
				for (var k in obj)
				{
					var v = obj[k];
					switch(typeof(v))
					{
						case 'function':
						case 'object':
							break;
						default:
						{
							e.css(k,v);
							break;
						}
					}
				}
			},
		  	getOpacity: function(id) 
			{	
				return this.getStyle(id,'opacity');
			},
			setOpacity: function(id,value)
			{
			    return el(id).opacity(value);
			},
			getDimensions: function(id) 
			{
				var element = el(id).get(0);
				var display = this.getStyle(id,'display');
				if (display != 'none' && display != null) // Safari bug
				  return {width: element.offsetWidth, height: element.offsetHeight};

				// All *Width and *Height properties give 0 on elements with display none,
				// so enable the element temporarily
				var els = element.style;
				var originalVisibility = els.visibility;
				var originalPosition = els.position;
				var originalDisplay = els.display;
				els.visibility = 'hidden';
				els.position = 'absolute';
				els.display = 'block';
				var originalWidth = element.clientWidth;
				var originalHeight = element.clientHeight;
				els.display = originalDisplay;
				els.position = originalPosition;
				els.visibility = originalVisibility;
				return {width: originalWidth, height: originalHeight};
			},
			show: function(id)
			{
				return el(id).show();
			},
			hide: function(id)
			{
				return el(id).hide();
			},
			visible:function(id)
			{
				return el(id).css('display') != 'none';
			},
		  	toggle: function(id)
			{
				if (this.visible(id))
				{
					return el(id).hide();
				}
				else
				{
					return el(id).show();
				}
		    },
			remove: function(id)
			{
				return el(id).remove();
			},
			update:function(id,html)
			{
				if (typeof(html)=='string')
				{
					return el(id).html(html);
				}
				return el(id).html(html.html());
			},
			replace:function(id,html)
			{
				return el(id).replaceWith(html);
			},
			up:function(id)
			{
				if (arguments.length == 1)
				{
					return el(id).get(0).parentNode;
				}	
				else
				{
					return collect(el(id).parents(arguments[1]));
				}
			},
			down:function(id)
			{
				var children = collect(arguments.length == 1 ? el(id).children() : el(id).children(arguments[1]));
				return arguments.length == 1 ? children[0] : a;
			},
			previous:function(id)
			{
				return el(id).previous().get(0);
			},
			next:function(id)
			{
				return el(id).next().get(0);
			},
			select:function(expr)
			{
				return collect($(expr));
			},
			getHeight:function(el)
			{
				return el(id).height();
			},
			getWidth:function(el)
			{
				return el(id).width();
			}
		};
		Element.ClassNames = function(el,value)
		{
			this.el = el;
			this.value = value;
			this.set = function(cn)
			{
				this.el.css('class',cn);
			}
			this.add = function(cn)
			{
				this.el.addClass(cn);
			}
			this.remove = function(cn)
			{
				this.el.removeClass(cn);
			}
			this.toString = function()
			{
				return this.value;
			}
			this._each = function(iter)
			{
				$.each(this.value.split(' '),function()
				{
					iter(this);
				});
			}
		};
		
		// Insertion mapping
		Insertion = 
		{
			Before: function(element, content) 
			{
				el(element).insertBefore(content);
			},

			Top: function(element, content) 
			{
			  	el(element).prepend(content);
			},

			Bottom: function(element, content) 
			{
			  	el(element).append(content);
			},

			After: function(element, content) 
			{
			  	el(element).insertAfter(content);
			}
		};

	}

	if (typeof(Scriptaculous)=='undefined')
	{
		Scriptaculous = 
		{
			Version: '1.8.1'
		};
		
		var effectNames = 
		{
			'blindDown': {},
			'blindUp': {},
			'slideUp': {},
			'slideDown': {},
			'appear': {},
			'fade': {},
			'move': null,	   /* no conversion */
			'opacity': null,   /* no conversion */
			'scale': {},
			'highlight': 
			{
				'params':
				{
					'startcolor':{ name:'backgroundColor', defaultValue:'#ffff99' }
				}
			},
			'scrollTo': {},
			'puff': {},
			'switchOff': {},
			'dropOut': {},
			'shake': {},
			'squish': {},
			'shrink': {},
			'pulsate': {},
			'fold': {},
			'morph': {}
		};

		// Scriptaculous Effect mapping
		Effect = {};
		for (var name in effectNames)
		{
			// map new Effect.BlindUp(id,params) => $('#id').blindDown()
			var details = effectNames[name];
			if (typeof(details)!='object') continue;
			(function(name,details)
			{
				var fnName = $.proper(name);
				Effect[fnName] = function(id,params)
				{
					//TODO: how to deal with parameter mapping?
					//TODO: how to deal with afterFinish type events
					//TODO: deal with transitions
					var args = params || {};
					if (details.params)
					{
						for (var k in details.params)
						{
							var i = details.params[k];
							args[i.name] = (params && params[k]) || i.defaultValue; 
						}
					}
					el(id)[name](args);
				};
			})(name,details);
		}
	}
	
	$.fn.effect = function(params)
	{
		var target = el(params.id || $(this).attr('id'));
		var effectName = null;
		var opts = {};
		for (var p in params)
		{
			switch(p)
			{
				case 'source':
				case 'id':
				{
					break;
				}
				default:
				{
					var f = effectNames[p];
					if (!f)
					{
						f = effectNames[p.toLowerCase()];
						if (!f)
						{
							f = effectNames[$.proper(p)];
						}
					}
					if (f)
					{
						effectName = p;
						break;
					}
					opts[p]=params[p];
				}
			}
		}
		if (!effectName) throw "Couldn't find effect in parameters";
		// must go through scriptaculous adapter to get backwards-compat parameter mapping
		new Effect[$.proper(effectName)](target,opts);
		return target;
	};
	
	// Appcelerator.Browser mapping
	Appcelerator.Browser = {};
	
	for (var p in AppC.UA)
	{
		switch(p)
		{
			case 'flash':
			case 'flashVersion':
			case 'silverlight':
			case 'silverlightVersion':
			case 'platform':
			{
				Appcelerator.Browser[p] = AppC.UA[p];
				break;
			}
			default:
			{
				Appcelerator.Browser['is' + $.proper(p)] = AppC.UA[p];
				break;
			}
		}
	}
	
	// expose externally
	window.getJsonTemplateVar = App.getJsonTemplateVar;
	
	Object.getNestedProperty = function(obj,prop,def)
	{
		return $.getNestedProperty(obj,prop,def);
	};
	
	// Appcelerator.Compiler mapping
	Appcelerator.Compiler = 
	{
		compileTemplate: AppC.compileTemplate,
		
		getHtml: function(id,convertHtmlPrefix)
		{
			convertHtmlPrefix = (convertHtmlPrefix==null) ? true : convertHtmlPrefix;
			var html = this.convertHtml(el(id).html(),convertHtmlPrefix);
			return html;
		},
		addIENameSpace: function(html)
		{
			return '<?xml:namespace prefix = app ns = "http://www.appcelerator.org" /> ' + html;
		},
		destroyContent:function()
		{
		},
		dynamicCompile:function()
		{
			//TODO
		},
		convertHtml: function (html, convertHtmlPrefix)
		{
			// convert funky url-encoded parameters escaped
			if (html.indexOf('#%7B')!=-1)
			{
			   html = html.gsub('#%7B','#{').gsub('%7D','}');
		    }

			// IE/Opera unescape XML in innerHTML, need to escape it back
			html = html.gsub(/\\\"/,'&quot;');

			if (convertHtmlPrefix)
			{
				return (html!=null) ? this.specialMagicParseHtml(html) : '';
			}
			else
			{
				return html;
			}
		},
		removeHtmlPrefix: function(html)
		{
		    if (Appcelerator.Browser.isIE)
		    {
		        html = html.gsub(/<\?xml:namespace(.*?)\/>/i,'');
		    }
		    return html.gsub(/html:/i,'').gsub(/><\/img>/i,'/>');
		},
		specialMagicParseHtml: function(html,prefix)
		{
		    var beginTag = '<APP:';
		    var endTag = '</APP:';

		    var idx = html.indexOf(beginTag);
		    if (idx < 0)
		    {
		        return this.removeHtmlPrefix(html);
		    }

		    var myhtml = this.removeHtmlPrefix(html.substring(0,idx));

		    var startIdx = idx + beginTag.length;

		    var tagEnd = html.indexOf('>',startIdx);

		    var tagSpace = html.indexOf(' ',startIdx);
		    if (tagSpace<0 || tagEnd<tagSpace)
		    {
		        tagSpace=tagEnd;
		    }
		    var tagName = html.substring(startIdx,tagSpace);
		    var endTagName = endTag+tagName+'>';

		    while ( true )
		    {
		        var lastIdx = html.indexOf(endTagName,startIdx);
		        var endTagIdx = html.indexOf('>',startIdx);
		        var lastTagIdx = html.indexOf('>',lastIdx);
		        var content = html.substring(endTagIdx+1,lastIdx);
		        // check to see if we're within a nested element of the same name
		        var dupidx = content.indexOf(beginTag+tagName);
		        if (dupidx!=-1)
		        {
		            startIdx=lastIdx+endTagName.length;
		            continue;
		        }
		        var specialHtml = html.substring(idx,lastIdx+endTagName.length);
		        if (Appcelerator.Browser.isIE)
		        {
		            specialHtml = this.removeHtmlPrefix(specialHtml);
		        }
		        myhtml+=specialHtml;
		        break;
		    }

		    myhtml+=this.specialMagicParseHtml(html.substring(lastTagIdx+1),prefix);
		    return myhtml;
		},
		makeAction: function (id,value,additionalParams)
		{
			var target = el(id);
			var meta = App.makeCustomAction(target,value);
			return function()
			{
				App.triggerAction(target,null,meta);
			};
		},
		handleCondition: function(clause)
		{
			$.info('handleCondition called with '+clause)
			//FIXME
			//Appcelerator.Compiler.handleCondition(child, open, 'function['+scriptcode+']', null, 0, null);
		}
	};
	
	// Appcelerator.Parameters
	Appcelerator.Parameters = 
	{
		get: function(name)
		{
			return AppC.params[name];
		}
	};
	
	// AppceleratorConfig mapping
	// hook into the compiler to set before we compile
	AppC.beforeCompile(function()
	{
		if (typeof(AppceleratorConfig)=='object')
		{
			for (var p in AppceleratorConfig)
			{
				AppC.config[p]=AppceleratorConfig[p];
			}
		}
	});

	// Appcelerator.Util mapping
	Appcelerator.Util = {};
	
	// Appcelerator.Util.Cookie mapping
	Appcelerator.Util.Cookie = 
	{
		GetCookie: function(name)
		{
			return $.cookie(name);
		},
		SetCookie: function(name,value,expires,path,domain,secure)
		{
			var opts = expires ? {} : null;
			if (expires) opts.expires = expires;
			if (path) opts.path = path;
			if (domain) opts.domain = domain;
			if (secure) opts.secure = secure;
			$.cookie(name,value,opts);
		},
		DeleteCookie:function(name)
		{
			$.cookie(name,null);
		}
	};

	// Appcelerator.Localization mapping
	Appcelerator.Localization = 
	{
		currentLanguage: AppC.locale,
		addLanguageBundle: function(lang,displayName,map)
		{
			//FIXME
		},
		updateLanguageBundle:function(lang,displayName,map)
		{
			//FIXME
		},
		getWithFormat:function (key, defValue, lang, args)
		{
			//FIXME
		}
	};
	
	var supportedTags = 
	[
		'div',
		'span',
		'input',
		'a',
		'td',
		'select',
		'option',
		'li',
		'h1',
		'h2',
		'h3',
		'h4',
		'ol',
		'legend',
	    'img'
	];
	
	// register attribute listener
	App.reg('langid',supportedTags,function(value,state)
	{
		//FIXME
	});
	

	// listen for localization events
	$(document).bind('localized',function(lang)
	{
		Appcelerator.Localization.currentLanguage = lang;		
	});
	
	// Array mapping
	Object.extend(Array.prototype,
	{
		each:function(iterator)
		{
			$.each(this,function(idx)
			{
				iterator(this,idx);
			});
		},
		findAll:function(f)
		{
			var r = [];
			$.each(this,function(idx)
			{
				if (f(this,idx))
				{
					r.push(this);
				}
			});
			return r;
		}
	});

	//
	// core support for older widgets not ported to widget API
	//
	Appcelerator.Core = 
	{
		loadModuleCSS: function(name,file)
		{
			var widgetName = $.gsub(name,':','_');
			var url  = AppC.docRoot + 'widgets/' + widgetName + '/css/' + file;
			$.loadCSS(url);
		}
	};
	
	//
	// widgets support
	//

	var widgets = {};

	Appcelerator.Widget = 
	{
		register: function(name,factory)
		{
			widgets[name]=factory;
		}
	};
	
	//
	// remap our action invocation to hook into the action to
	// handle components that have special actions
	//
	App._invokeAction = App.invokeAction;
	App.invokeAction = function(name,params)
	{
		//
		// this will only be executed if we are in compat mode
		//
		var id = this.attr('id');
		var idx = id.indexOf('_widget');
		if (idx > 0)
		{
			var widgetid = id.substring(0,idx);
			var widgetEl = $('#'+widgetid);
			var widget = widgetEl.data('widget');
			if (widget)
			{
				var parameters = widgetEl.data('widget.parameters');
				var fn = widget[name];
				if (typeof(fn)=='function')
				{
					fn.apply(widget,[widgetid,parameters,params,this]);
					return;
				}
			}
		}
		return App._invokeAction.apply(this,[name,params]);
	};
	
	function loadWidget(name,state,el,path)
	{
		var factory = widgets[name];
		if (!factory)
		{
			var widgetName = $.gsub(name,':','_');
			var js = widgetName + (AppC.params.debug ? '_debug' : '') + '.js';
			path = AppC.docRoot + 'widgets/' + widgetName + '/';
			var url  = path + js;
			$.getScript(url,function()
			{
				loadWidget(name,state,el,path);
			});
		}
		else
		{
			if (factory.setPath)
			{
				factory.setPath(path);
			}
			var opts = {};
			var errors = false, msg = null;
			$.each(factory.getAttributes(),function()
			{
				var value = el.attr(this.name) || this.defaultValue;
				if ((typeof(value)=='undefined'||value=='') && !this.optional)
				{
					msg = "Missing required attribute: '"+this.name+"' for widget: "+name+", id: "+el.attr('id');
					errors = true;
					return false;
				}
				opts[this.name]=value;
			});
			if (errors)
			{
				$.error(msg);
				el.replaceWith("<div class='widget-error'>"+msg+"</div>");
				App.checkState(state,el);
				return;
			}
			var ins = factory.buildWidget(el.get(0),opts);
			var id = el.attr('id');
			var html = ins.presentation;
			if (ins.parameters) opts = ins.parameters;
			// rename the real ID
			el.attr('id',id+'_widget');
			// widgets can define the tag in which they should be wrapped
			if(ins.parent_tag != 'none' && ins.parent_tag != '')
			{
			   var parent_tag = ins.parent_tag || 'div';
			   html = '<'+parent_tag+' id="'+id+'_temp" style="margin:0;padding:0;visibility:hidden">'+html+'</'+parent_tag+'>';
			}

			// add the XML namespace IE thing but only if you have what looks to
			// be a widget that requires namespace - otherwise, it will causes issues like when
			// you include a single <img>
			if (AppC.UA.IE && html.indexOf('<app:') != -1)
			{
				html = Appcelerator.Compiler.addIENameSpace(html);
			}
			
			el.replaceWith(html)
			new Insertion.Before(el,html);
			Element.remove(el);

			var newEl = $('#'+id+'_temp');
			newEl.attr('id',id);
			newEl.data('widget',factory);
			newEl.data('widget.parameters',opts);
			newEl.data('widget.element',el); // keep a reference to old guy so we can still use it and it doesn't get gc

			if (ins.compile)
			{
				//FIXME
				factory.compileWidget(opts,newEl.get(0));
			}

			newEl.visible();
			App.checkState(state,newEl);
		}
	}
	
	App.reg('nodeName~=APP','*',function(tag,state)
	{
		// we have to double-check the tag again given that
		// we're using a wildcard and an expression we're going to 
		// get each element visited here
		if ($.startsWith(tag,'app'))
		{
			this.hidden();
			var widget = tag.split(':')[1];
			$.debug('found widget: '+tag+', name: '+widget);
			loadWidget(tag,state,this);
			return true;
		}
		return false;
	},true);
	
	// Message Broker mapping
	window.$MQ = function (name,opts,scope,version)
	{
		$(document).pub(name,opts,scope,version);
	}
	
	// Mesage Queue Listener mapping
	window.$MQL = function(type,f,myscope,element)
	{
		$(element || document).sub(type,function(data,scope,version,name,direction)
		{
			if (myscope && myscope!='*' && scope != myscope)
			{
				return;
			}
			f.apply(f,[name,data,'JSON',direction,scope,version]);
		});
	}
	
	// web expression macros mapping
	window.$WEM = function()
	{
		//FIXME
	}
	
	// Event mapping
	Object.extend(Event,
	{
		getEvent:function(e)
		{
	    	return e || window.event;
		}
	});
	
	Object.extend(Event.prototype,
	{
		stop:function()
		{
			this.stopPropagation();
			return false;
		}
	});

})(jQuery);

//
// TODO:
//
// - Logging
// - WEM
// - interceptors for ServiceBroker (perfStats stuff)
//
