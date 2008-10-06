
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

		// Event mapping
		Object.extend(Event.prototype,
		{
			stop:function()
			{
				this.stopPropagation();
				return false;
			}
		});
		
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

	// String mapping defined in older Appcelerator (not Prototype)
	Object.extend(String.prototype, 
	{
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
		toFunction:function()
		{
			return $.toFunction(this);
		},
		encode64: function()
		{
			return $.encode64(this);
		},
		decode64: function()
		{
			return $.decode64(this);
		}
	});

	// these are defined in old String classes (not in Prototype)
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
			if (AppC.UA.IE)
			{
				// IE requires this to parse the app: widgets correctly...
				return '<?xml:namespace prefix = app ns = "http://www.appcelerator.org" /> ' + html;
			}
			return html;
		},
		addTrash: function(fn)
		{
			//FIXME
		},
		destroyContent:function()
		{
			//FIXME
		},
		executeFunction: function(element,name,args,required)
		{
			//FIXME
			$.info('executeFunction called '+name);
		},
		dynamicCompile:function(element)
		{
			var e = el(element);
			var state = App.createState(e);
			e.compileChildren(state,true);
			App.checkState(state,e);
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
	App.invokeAction = function(name,data,params)
	{
		//
		// this will only be executed if we are in compat mode
		//
		var id = this.attr('id');
		var idx = id.indexOf('_widget');
		if (idx > 0)
		{
			// widgets that are replaced initially have _widget appended,
			// but the action has the pre id, remove it
			id = id.substring(0,idx);
		}
		var entry = App.getData(id);
		if (entry)
		{
			var widget = entry.widget;
			if (widget)
			{
				var parameters = entry.parameters;
				var fn = widget[name];
				if (typeof(fn)=='function')
				{
					fn.apply(widget,[id,parameters,params,this]);
					return;
				}
			}
		}
		return App._invokeAction.apply(this,[name,data,params]);
	};
	
	Appcelerator.Compiler.POSITION_REMOVE = -1;
	Appcelerator.Compiler.POSITION_REPLACE = 0;
	Appcelerator.Compiler.POSITION_TOP = 1;
	Appcelerator.Compiler.POSITION_BOTTOM = 2;
	Appcelerator.Compiler.POSITION_BEFORE = 3;
	Appcelerator.Compiler.POSITION_AFTER = 4;
	Appcelerator.Compiler.POSITION_BODY_TOP = 5;
	Appcelerator.Compiler.POSITION_BODY_BOTTOM = 6;
	Appcelerator.Compiler.POSITION_HEAD_TOP = 7;
	Appcelerator.Compiler.POSITION_HEAD_BOTTOM = 8;
	
	
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
			var id = el.attr('id');
			var opts = {id:id};
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
			var html = ins.presentation;
			if (ins.parameters) opts = ins.parameters;
			var remove = (ins.position == Appcelerator.Compiler.POSITION_REMOVE);
			if (!remove)
			{
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

				el.replaceWith(html);
				new Insertion.Before(el,html);
			}
			
			App.setData(id,{
				'type':'widget',
				'widget':factory,
				'parameters':opts,
				'element': el
			});
			
			Element.remove(el);

			var newEl = el;
			
			if (!remove)
			{
				newEl = $('#'+id+'_temp');
				newEl.attr('id',id);
			}
			
			//FIXME - do custom conditions...
			//FIXME - do fieldset
			
			if (ins.compile)
			{
				factory.compileWidget(opts,newEl);
			}

            if (!remove && ins.wire)
            {
				$(newEl).compileChildren(state,false);
            }

			if (!remove) newEl.visible();
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
		},
		stopObserving: function(id,name,fn)
		{
			//FIXME
		},
	    getKeyCode: function (event)
	    {
	        var pK;
	        if (event)
	        {
	            if (typeof(event.keyCode) != "undefined")
	            {
	                pK = event.keyCode;
	            }
	            else if (typeof(event.which) != "undefined")
	            {
	                pK = event.which;
	            }
	        }
	        else
	        {
	            pK = window.event.keyCode;
	        }
	        return pK;
	    },
	    isKey: function (event, code)
	    {
	        return Event.getKeyCode(event) == code;
	    },
	    isEscapeKey: function(event)
	    {
	        return Event.isKey(event, Event.KEY_ESC) || Event.isKey(event, event.DOM_VK_ESCAPE);
	    },
	    isEnterKey: function(event)
	    {
	        return Event.isKey(event, Event.KEY_RETURN) || Event.isKey(event, event.DOM_VK_ENTER);
	    },
	    isSpaceBarKey: function (event)
	    {
	        return Event.isKey(event, Event.KEY_SPACEBAR) || Event.isKey(event, event.DOM_VK_SPACE);
	    },
	    isPageUpKey: function (event)
	    {
	        return Event.isKey(event, Event.KEY_PAGEUP) || Event.isKey(event, event.DOM_VK_PAGE_UP);
	    },
	    isPageDownKey: function (event)
	    {
	        return Event.isKey(event, Event.KEY_PAGEDOWN) || Event.isKey(event, event.DOM_VK_PAGE_DOWN);
	    },
	    isHomeKey: function (event)
	    {
	        return Event.isKey(event, Event.KEY_HOME) || Event.isKey(event, event.DOM_VK_HOME);
	    },
	    isEndKey: function (event)
	    {
	        return Event.isKey(event, Event.KEY_END) || Event.isKey(event, event.DOM_VK_END);
	    },
	    isDeleteKey: function (event)
	    {
	        return Event.isKey(event, Event.KEY_DELETE) || Event.isKey(event, event.DOM_VK_DELETE);
	    },
	    isLeftKey: function (event)
	    {
	        return Event.isKey(event, Event.KEY_LEFT) || Event.isKey(event, event.DOM_VK_LEFT);
	    },
	    isRightKey: function (event)
	    {
	        return Event.isKey(event, Event.KEY_RIGHT) || Event.isKey(event, event.DOM_VK_RIGHT);
	    },
	    KEY_SPACEBAR: 0,
	    KEY_PAGEUP: 33,
	    KEY_PAGEDOWN: 34,
	    KEY_END: 35,
	    KEY_HOME: 36,
	    KEY_DELETE: 46,
		observe:function(id,name,fn)
		{
			el(id).bind(name,function(e)
			{
				var f = fn.call(fn,e);
				if (f===false)
				{
					e.stopPropagation();
					return false;
				}
			});
		}
	});
	
	// Logger mapping
	Logger = 
	{
		logEnabled: typeof(console)!='undefined',
		debugEnabled: this.logEnabled && AppC.params.debug == 1 && console.debug,
		infoEnabled: this.logEnabled && console.info,
		warnEnabled: this.logEnabled && console.warn,
		errorEnabled: this.logEnabled && console.error,
		fatalEnabled: this.logEnabled && console.error,
		traceEnabled: this.debugEnabled,
		debug: function()
		{
			if (this.debugEnabled) $.debug.apply(this,arguments);
		},
		info: function()
		{
			if (Logger.infoEnabled) $.info.apply(this,arguments);
		},
		error: function()
		{
			if (Logger.errorEnabled) $.error.apply(this,arguments);
		},
		fata: function()
		{
			if (Logger.fatalEnabled) $.error.apply(this,arguments);
		},
		warn: function()
		{
			if (Logger.warnEnabled) $.warn.apply(this,arguments);
		},
		trace: function()
		{
			if (Logger.traceEnabled) $.debug.apply(this,arguments);
		}
	};

	if (typeof(log4javascript)!='undefined')
	{
		Logger.toLevel = function(value, logger)
		{
			if (!value)
				return log4javascript.Level.INFO;
			value = value.toUpperCase();
			if (value==log4javascript.Level.INFO.toString())
				return log4javascript.Level.INFO;
			else if (value==log4javascript.Level.WARN.toString())
				return log4javascript.Level.WARN;
			else if (value==log4javascript.Level.ERROR.toString())
				return log4javascript.Level.ERROR;
			else if (value==log4javascript.Level.FATAL.toString())
				return log4javascript.Level.FATAL;
			else if (value==log4javascript.Level.TRACE.toString())
				return log4javascript.Level.TRACE;
			else if (value==log4javascript.Level.DEBUG.toString())
				return log4javascript.Level.DEBUG;

			return logger.getLevel();
		}
		
		var log4javascript_threshold = Appcelerator.Parameters.get('log4javascript');
		var _log = log4javascript.getDefaultLogger();
		var Level = Logger.toLevel(log4javascript_threshold, _log);
		Logger.infoEnabled = log4javascript.Level.INFO.isGreaterOrEqual(Level);
		Logger.warnEnabled = log4javascript.Level.WARN.isGreaterOrEqual(Level);
		Logger.errorEnabled = log4javascript.Level.ERROR.isGreaterOrEqual(Level);
		Logger.fatalEnabled = log4javascript.Level.FATAL.isGreaterOrEqual(Level);
		Logger.traceEnabled = log4javascript.Level.TRACE.isGreaterOrEqual(Level);
		Logger.debugEnabled = log4javascript.Level.DEBUG.isGreaterOrEqual(Level);
		
		Logger.debug = function(msg)
		{
			 if (Logger.debugEnabled) _log.debug(msg);
		};
		Logger.warn = function(msg)
		{
			 if (Logger.warnEnabled) _log.warn(msg);
		};
		Logger.info = function(msg)
		{
			 if (Logger.infoEnabled) _log.info(msg);
		};
		Logger.error = function(msg)
		{
			 if (Logger.errorEnabled) _log.error(msg);
		};
		Logger.fatal = function(msg)
		{
			 if (Logger.fatalEnabled) _log.fatal(msg);
		};
		Logger.trace = function(msg)
		{
			 if (Logger.traceEnabled) _log.trace(msg);
		};
	}
	
	// DEBUG macro
	window.$D = function()
	{
		$.debug.apply(this,arguments);
	};
	
	// ERROR macro
	window.$E = function()
	{
		$.error.apply(this,arguments);
	};

	Object.extend(
	{
		/**
		 * do an eval with code in the scope putting scope as the 
		 * this reference
		 */
		evalWithinScope: function (code, scope)
		{
		    if (code == '{}') return {};

			// make sure we escape any quotes given we're building a string with quotes
			var expr = code.gsub('"',"\\\"");

		    // create the function
		    var func = eval('var f = function(){return eval("(' + expr + ')")}; f;');

		    // now invoke our scoped eval with scope as the this reference
		    return func.call(scope);
		},
		/**
		 * return a formatted message detail for an exception object
		 */
		getExceptionDetail: function (e,format)
		{
		    if (!e) return 'No Exception Object';

			if (typeof(e) == 'string')
			{
				return 'message: ' + e;
			}

		    if (Appcelerator.Browser.isIE)
		    {
		        return 'message: ' + e.message + ', location: ' + e.location || e.number || 0;
		    }
		    else
		    {
				var line = 0;
				try
				{
					line = e.lineNumber || 0;
				}
				catch(x)
				{
					// sometimes you'll get a PermissionDenied on certain errors
				}
		        return 'message: ' + (e.message || e) + ', location: ' + line + ', stack: ' + (format?'<pre>':'') +(e.stack || 'not specified') + (format?'</pre>':'');
		    }
		},
		/**
		 * returns true if object passed in as a boolean
		 */
		isBoolean: function(object)
		{
		    return typeof(object)=='boolean';
		}
	});

	
})(jQuery);

//
// TODO:
//
// - WEM
// - interceptors for ServiceBroker (perfStats stuff)
//
