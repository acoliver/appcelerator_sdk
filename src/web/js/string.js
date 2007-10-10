
Object.extend(String.prototype,
{
	/**
	 * trims leading and trailing spaces
	 */
    trim: function()
    {
        return this.replace(/^\s+/g, '').replace(/\s+$/g, '');
    },

	/**
	 * return true if this string starts with value
	 */
    startsWith: function(value)
    {
        if (value.length <= this.length)
        {
            return this.substring(0, value.length) == value;
        }
        return false;
    },

	/**
	 * eval the contents of the string as a javascript function
	 * and return the function reference
	 */
    toFunction: function (dontPreProcess)
    {
        var str = this.trim();
        if (str.length == 0)
        {
            return Prototype.emptyFunction;
        }
        if (!dontPreProcess)
        {
            if (str.match(/^function\(/))
            {
                str = 'return ' + String.unescapeXML(this) + '()';
            }
            else if (!str.match(/return/))
            {
                str = 'return ' + String.unescapeXML(this);
            }
            else if (str.match(/^return function/))
            {
                // invoke it as the return value
                str = String.unescapeXML(this) + ' ();';
            }
        }
        var code = 'var f = function(){ var args = $A(arguments); ' + str + '}; f;';
        var func = eval(code);
        if (typeof(func) == 'function')
        {
            return func;
        }
        throw Error('code was not a function: ' + this);
    },

	toFunctionString: function (functionId)
	{
		var str = this.trim();
        var code = 'var functionString_'+functionId+' = function(){ var args = $A(arguments); ' + str + '}; functionString_'+functionId+'();';
		return code;
	}

});


/**
 * escape XML entities in the value passed
 */
String.escapeXML = function(value)
{
    var str = "";
    for (var c = 0; c < value.length; c++)
    {
        var ch = value.charAt(c);
        if (ch == '"')
        {
            str += "&quot;";
        }
        else if (ch == '&')
        {
            str += "&amp;";
        }
        else if (ch == '>')
        {
            str += "&gt;";
        }
        else if (ch == '<')
        {
            str += "&lt;";
        }
        else if (ch == '\'')
        {
            str += "&apos;";
        }
        else
        {
            str += ch;
        }
    }
    return str;
};

/**
 * unescape XML entities back into their normal values
 */
String.unescapeXML = function(value)
{
    if (!value) return null;
    var v = value.replace(/&lt;/g, "<");
    v = v.replace(/&gt;/g, ">");
    v = v.replace(/&apos;/g, "'");
    v = v.replace(/&amp;/g, "&");
    v = v.replace(/&quot;/g, "\"");
    return v;
};


// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

String.prototype.encode64 = function() 
{
   var input = this;
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
};

String.prototype.decode64 = function () {
   var output = "";
   var chr1, chr2, chr3;
   var enc1, enc2, enc3, enc4;
   var i = 0;
   
   var input = this;

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
};

String.stringValue = function(str) {
	if (str)
	{
		return '"'+str.replace(/"/g, '\\"')+'"';
	}
	else
	{
		return null;
	}
};