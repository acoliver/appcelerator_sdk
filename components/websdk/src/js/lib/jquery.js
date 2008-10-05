
var debug = AppC.params.debug && AppC.params.debug == '1' || AppC.params.debug == true;
var hasConsole = typeof(console)!='undefined';
var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

$.extend(
{
	domText:function(dom)
	{
		var str = '';
		for (var c=0;c<dom.childNodes.length;c++)
		{
			str+=dom.childNodes[c].nodeValue||'';
		}
		return $.trim(str);
	},
	gsub:function(source,pattern,replacement)
	{
		if (typeof(replacement)=='string')
		{
			var r = String(replacement);
			replacement = function()
			{
				return r;
			}
		}
	 	var result = '', match;
	    while (source.length > 0) {
	      if (match = source.match(pattern)) {
	        result += source.slice(0, match.index);
	        result += this.string(replacement(match));
	        source  = source.slice(match.index + match[0].length);
	      } else {
	        result += source, source = '';
	      }
	    }
		return result;
	},
	camel: function(value)
	{
	    var parts = value.split('-'), len = parts.length;
	    if (len == 1) return parts[0];

	    var camelized = value.charAt(0) == '-'
	      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
	      : parts[0];

	    for (var i = 1; i < len; i++)
	      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

	    return camelized;
	},
	string: function(value)
	{
	    return value == null ? '' : String(value);
	},
	proper: function(value)
	{
		return value.charAt(0).toUpperCase() + value.substring(1);
	},
	smartSplit: function(value,splitter)
	{
		if (typeof(value)!='string')
		{
			//throw "Invalid parameter passed to smartSplit: "+typeof(value)+", value: "+value;
			$.error("Invalid parameter passed to smartSplit: "+typeof(value)+", value: "+value);
		}
		value = this.trim(value);
		var tokens = value.split(splitter);
		if(tokens.length == 1) return tokens;
		var array = [];
		var current = null;
		for (var c=0;c<tokens.length;c++)
		{
			var line = tokens[c];
			if (!current && line.charAt(0)=='(')
			{
				current = line + ' or ';
				continue;
			}
			else if (current && current.charAt(0)=='(')
			{
				if (line.indexOf(') ')!=-1)
				{
					array.push(current+line);
					current = null;
				}
				else
				{
					current+=line + ' or ';
				}
				continue;
			}
			if (!current && line.indexOf('[')>=0 && line.indexOf(']')==-1)
			{
				if (current)
				{
					current+=splitter+line;
				}
				else
				{
					current = line;
				}
			}
			else if (current && line.indexOf(']')==-1)
			{
				current+=splitter+line;
			}
			else
			{
				if (current)
				{
					array.push(current+splitter+line)
					current=null;
				}
				else
				{
					array.push(line);
				}
			}
		}
		return array;
	},
	escapeXML: function(value)
	{
		if (!value) return null;
	    return value.replace(
	    /&/g, "&amp;").replace(
	    /</g, "&lt;").replace(
	    />/g, "&gt;").replace(
	    /"/g, "&quot;").replace(
	    /'/g, "&apos;");
	},
	unescapeXML: function(value)
	{
	    if (!value) return null;
	    return value.replace(
		/&lt;/g,   "<").replace(
		/&gt;/g,   ">").replace(
		/&apos;/g, "'").replace(
		/&amp;/g,  "&").replace(
		/&quot;/g, "\"");
	},
	emptyFunction: function(){},
	toFunction: function (str,dontPreProcess)
    {
        var str = $.trim(str);
        if (str.length == 0)
        {
            return this.emptyFunction;
        }
        if (!dontPreProcess)
        {
            if (str.match(/^function\(/))
            {
                str = 'return ' + this.unescapeXML(str) + '()';
            }
            else if (!str.match(/return/))
            {
                str = 'return ' + this.unescapeXML(str);
            }
            else if (str.match(/^return function/))
            {
                // invoke it as the return value
                str = this.unescapeXML(str) + ' ();';
            }
        }
        var code = 'var f = function(){ var args = $.makeArray(arguments); ' + str + '}; f;';
        var func = eval(code);
        if (this.isFunction(func))
        {
            return func;
        }
        throw Error('code was not a function: ' + this);
    },
	/**
	 * simple function will walk the properties of an object
	 * based on dotted notatation. example:
	 *
	 *  var obj = {
	 *        foo: {
	 *           bar: 'a',
	 *           foo: {
	 *              bar: 1,
	 *              jeff: 'haynie'
	 *           }
	 *        }
	 *  };
	 *
	 *  var value = $.getNestedProperty(obj,'foo.foo.jeff')
	 *  
	 * The value variable should equal 'haynie'
	 */
	getNestedProperty: function (obj, prop, def)
	{
	    if (obj!=null && prop!=null)
	    {
	        var props = prop.split('.');
	        if (props.length != -1)
	        {
		        var cur = obj;
		        this.each(props,function()
		        {
					var p = this;
		            if (null != cur[p])
		            {
		                cur = cur[p];
		            }
		            else
		            {
		                cur = null;
		                return false;
		            }
		        });
		        return cur == null ? def : cur;
		     }
		     else
		     {
		     	  return obj[prop] == null ? def : obj[prop];
		     }
	    }
	    return def;
	},
    startsWith: function(a,b)
    {
    	return a.indexOf(b) === 0;
    },
	error:function()
	{
		var log = this.makeArray(arguments).join(' ');
		if (hasConsole)
		{
			if ($.isFunction(console.error))
			{
				console.error(log);
			}
			else if ($.isFunction(console.log))
			{
				console.log(log);
			}
		}
	},
	info:function()
	{
		var log = this.makeArray(arguments).join(' ');
		if (hasConsole)
		{
			if ($.isFunction(console.info))
			{
				console.info(log);
			}
			else if ($.isFunction(console.log))
			{
				console.log(log);
			}
		}
	},
	debug:function()
	{
		if (debug)
		{
			var log = this.makeArray(arguments).join(' ');
			if (hasConsole)
			{
				if ($.isFunction(console.debug))
				{
					console.debug(log);
				}
				else if ($.isFunction(console.log))
				{
					console.log(log);
				}
			}
		}
	},
	encode64: function(input) 
	{
	   var output = "";
	   var chr1, chr2, chr3;
	   var enc1, enc2, enc3, enc4;
	   var i = 0;
	
	   do {
	      chr1 = input.charCodeAt(i++);
	      chr2 = input.charCodeAt(i++);
	      chr3 = input.charCodeAt(i++);
	
	      enc1 = chr1 >> 2;
	      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	      enc4 = chr3 & 63;
	
	      if (isNaN(chr2)) {
	         enc3 = enc4 = 64;
	      } else if (isNaN(chr3)) {
	         enc4 = 64;
	      }
	
	      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + 
	         keyStr.charAt(enc3) + keyStr.charAt(enc4);
	   } while (i < input.length);
	   
	   return output;
	},
	decode64: function (input) 
	{
	   var output = "";
	   var chr1, chr2, chr3;
	   var enc1, enc2, enc3, enc4;
	   var i = 0;
	   
	   // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	   input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	
	   do {
	      enc1 = keyStr.indexOf(input.charAt(i++));
	      enc2 = keyStr.indexOf(input.charAt(i++));
	      enc3 = keyStr.indexOf(input.charAt(i++));
	      enc4 = keyStr.indexOf(input.charAt(i++));
	
	      chr1 = (enc1 << 2) | (enc2 >> 4);
	      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	      chr3 = ((enc3 & 3) << 6) | enc4;
	
	      output = output + String.fromCharCode(chr1);
	
	      if (enc3 != 64) {
	         output = output + String.fromCharCode(chr2);
	      }
	      if (enc4 != 64) {
	         output = output + String.fromCharCode(chr3);
	      }
	   } while (i < input.length);
	
	   return output;
	},
	toQueryString:function(obj)
	{
		var qs = [];
		for (var k in obj)
		{
			var v = obj[k];
			var t = typeof(v);
			switch(t)
			{
				case 'number':
				case 'string':
				case 'boolean':
				{
					qs.push(encodeURIComponent(k)+'='+encodeURIComponent(String(v)));
					break;
				}
				case 'object':
				{
					qs.push(encodeURIComponent(k)+'='+encodeURIComponent($.toJSON(v)));
					break;
				}
			}
		}
		return qs.join('&');
	},
	loadCSS: function(url)
	{
		var head = document.getElementsByTagName("head")[0];
		var link = document.createElement("link");
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = url;
		head.appendChild(link);
	}
});


/* Based on Alex Arnell's inheritance implementation. */
$.Class = {
  create: function() {
    var parent = null, properties = $.makeArray(arguments);
    if ($.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    $.Class.extend(klass, $.Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = $.emptyFunction;

    klass.prototype.constructor = klass;

    return klass;
  }
};

$.Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = [];
	for (var key in source)
	{
		properties.push(key);
	}

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      this.prototype[property] = value;
    }

    return this;
  }
};

$.Class.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

// public API support
AppC.create = $.Class.create;
AppC.extend = $.Class.extend;

$.fn.delay = function(fn,delay)
{
	var scope = this;
	// support either first argument is number and second is function -or-
	// first argument is function and second is number ... sometimes more readable is number first
	var f = typeof(fn)=='number' ? delay : fn;
	var n = typeof(fn)=='function' ? delay : fn;
	setTimeout(function(){ 
		f.call(scope);
	},(n||0.1)*1000);
	return this;
};

$.fn.defer = function(fn,delay)
{
	$(this).delay(fn,0.001);
	return this;
};

