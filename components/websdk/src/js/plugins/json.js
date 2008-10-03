
/*! some of this code came from Prototype and has been adapted to jQuery
*  Prototype is (c) 2005-2007 Sam Stephenson
*  Prototype is freely distributable under the terms of an MIT-style license.
*  For details, see the Prototype web site: http://www.prototypejs.org/
*--------------------------------------------------------------------------*/

Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

String.specialChar = {
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
  '\\': '\\\\'
};

Number.prototype.toPaddedString= function(length, radix) {
  var string = this.toString(radix || 10);
  return '0'.times(length - string.length) + string;
};

String.prototype.toJSON = function() {
	var useDoubleQuotes = true;
    var escapedString = $.gsub(this,/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
};

Array.prototype.toJSON = function(){
    var results = [];
    $.each(this,function(object) {
      var value = $.toJSON(this);
      if (value !== undefined) results.push(value);
    });
    return '[' + results.join(', ') + ']';
};

Number.prototype.toJSON = function(){
    return isFinite(this) ? this.toString() : 'null';
};

Boolean.prototype.toJSON = function(){
	return String(this);
};

$.extend(
{
	toJSON:function(object)
	{
		var type = typeof object;
		switch (type) {
		  case 'undefined':
		  case 'function':
		  case 'unknown': return 'null';
		}

		if (object === null) return 'null';
		if (object.toJSON) return object.toJSON();
		if (object.nodeType == 1) return;

		var results = [];

		for (var property in object) 
		{
		   var value = object[property];
		   if (value !== undefined)
		   {
		   	  results.push($.toJSON(property) + ': ' + $.toJSON(value));
		   }
		}

		return '{' + results.join(', ') + '}';
	},

	JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

	unfilterJSON: function(str,filter) {
		var m = (filter || this.JSONFilter).exec(str);
		return m ? m[1] : str;
  	},

  	isJSON: function(s) {
    	var str = s.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    	return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  	},

  	evalJSON: function(str,sanitize) {
    	var json = this.unfilterJSON(str);
    	try {
      		if (!sanitize || $.isJSON(json)) return eval('(' + json + ')');
    	} catch (e) { }
    	throw new SyntaxError('Badly formed JSON string: ' + str);
  	}
});


