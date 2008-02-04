

/**
 * simple function that will set a dotted notation
 * property to the value specified.
 */
Object.setNestedProperty = function (obj, prop, value)
{
    var props = prop.split('.');
    var cur = obj;
    var prev = null;
    var last = null;
    props.each(function(p)
    {
        last = p;
        if (cur[p])
        {
            prev = cur;
            cur = cur[p];
        }
        else
        {
            prev = cur;
            cur = cur[p] = {};
        }
    });
    prev[last] = value;
    return obj;
};


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
 *  var value = Object.getNestedProperty(obj,'foo.foo.jeff')
 *  
 * The value variable should equal 'haynie'
 */
Object.getNestedProperty = function (obj, prop, def)
{
    if (obj!=null && prop!=null)
    {
        var props = prop.split('.');
        if (props.length != -1)
        {
	        var cur = obj;
	        props.each(function(p)
	        {
	            if (null != cur[p])
	            {
	                cur = cur[p];
	            }
	            else
	            {
	                cur = null;
	                throw $break;
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
};

/**
 * copy the properties only (exclude native and functions)
 * from the source to the target. this is very similiar
 * to prototype's extend, except for the exclusion principle
 */
Object.copy = function (target, source)
{
    if (source)
    {
        for (var p in source)
        {
            var obj = source[p];
            var type = typeof(obj);
            switch (type)
            {
                case 'string':
                case 'number':
                case 'boolean':
                case 'object':
                case 'array':
                {
                    target[p] = obj;
                    break;
                }
            }
        }
    }
    return target;
};

/**
 * do an eval with code in the scope putting scope as the 
 * this reference
 */
Object.evalWithinScope = function (code, scope)
{
    if (code == '{}') return {};

    // create the function
    var func = eval('var f = function(){return eval("(' + code + ')")}; f;');

    // now invoke our scoped eval with scope as the this reference
    return func.call(scope);
};

/**
 * return a formatted message detail for an exception object
 */
Object.getExceptionDetail = function (e,format)
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
        return 'message: ' + (e.message || e) + ', location: ' + line + ', stack: ' + (format?'<code>':'') +(e.stack || 'not specified') + (format?'</code>':'');
    }
};

/**
 * returns true if object passed in as a boolean
 */
Object.isBoolean = function(object)
{
    return typeof(object)=='boolean';
};

/**
 * Create an object with the given parameter as its prototype.
 * 
 * @param {Object} obj	object to mirror
 */
Object.mirror = function(obj) {
    var mirrorer = (function() {});
    mirrorer.prototype = obj;
    return new mirrorer();
}

/**
 * Clone an object and hide all the fields shared with the given namespace.
 * 
 * @param {Object} obj		object to clone		
 * @param {Object} without	fields to hide
 */
Object.cloneWithout = function(obj, without) {
	var clone = Object.clone(obj);
	for(var name in without) {
		clone[name] = undefined;
	}
	return clone;
}
