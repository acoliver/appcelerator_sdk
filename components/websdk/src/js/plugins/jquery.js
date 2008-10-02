$.extend(
{
	sub: function(pattern, replacement, count) 
	{
	  replacement = this.gsub.prepareReplacement(replacement);
	  count = count === undefined ? 1 : count;

	  return this.gsub(pattern, function(match) {
	    if (--count < 0) return match[0];
	    return replacement(match);
	  });
	},
	gsub:function(source,pattern,replacement)
	{
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
	string: function(value)
	{
	    return value == null ? '' : String(value);
	},
	smartSplit: function(value,splitter)
	{
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
        var code = 'var f = function(){ var args = $A(arguments); ' + str + '}; f;';
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
        if (b.length <= a.length)
        {
            return a.substring(0, b.length) == b;
        }
        return false;
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

