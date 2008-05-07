/*

Copyright (c) 2007 Travis Hensgen, http://mondea.com.au

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

var Jel = {
    version:    1.0
};

/*

Class: Jel.Lang
    *Language Resources* for the Jel library which allow it to be internationalised.
    
*/

Jel.Lang = 
{
    KEY:                            "en.us", 
    DATE_FORMAT:                    "m/d/Y",
    DATE_12_FORMAT:                 "m/d/Y g:i A"
};

Jel.Lang.String = 
{

};


/*

Class: Jel.Lang.Date
    Language resources for <Jel.Date>
    
*/


/* 
    Property: DAYS 
        an *array* of *long day name* string constants for the current language build. e.g. for English ["Sunday", ..., "Saturday"]. These are also used by <Jel.Date.format> and <Jel.Date.parse>.
    
    Example: 
        > Jel.Lang.Date.DAYS[4]; // Thursday
        > Jel.Lang.Date.DAYS[1]; // Monday
*/

/* 
    Property: DAYS_SHORT
        an *array* of *short day name* string constants for the current language build. e.g. for English ["Sun", ..., "Sat"]. These are also used by <Jel.Date.format> and <Jel.Date.parse>.
    
    Example: 
        > Jel.Lang.Date.DAYS_SHORT[4]; // Thu
        > Jel.Lang.Date.DAYS_SHORT[1]; // Mon
*/

/* 
    Property: MONTHS
        an *array* of *long month names* string constants for the current language build. e.g. for English ["January", ..., "December"]. These are also used by <Jel.Date.format> and <Jel.Date.parse>.
    
    Example: 
        > Jel.Lang.Date.MONTHS[4]; // May
        > Jel.Lang.Date.MONTHS[1]; // Februrary
*/

/* 
    Property: MONTHS_SHORT
        an array of *short month names* string constants for the current language build. e.g. for English ["Jan", ..., "Dec"]. These are also used by <Jel.Date.format> and <Jel.Date.parse>.

    Example: 
        > Jel.Lang.Date.MONTHS_SHORT[4]; // May
        > Jel.Lang.Date.MONTHS_SHORT[1]; // Feb
*/



Jel.Lang.Date = 
{
    DAYS: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    DAYS_SHORT: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    MONTHS: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    MONTHS_SHORT: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    MONTHS_LCASE: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    MONTHS_SHORT_LCASE: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
};
  
/*
Class: Jel.String
    *Utility Methods* for manipulating JavaScript's *built-in String class*
*/

Jel.String = 
{
    /*
        Method: repeat
            gets the *repeat* of a string for a specified *count*

        Arguments:
            str - string, the string to repeat
            count - integer, the delimiter to use between words. If not specified, a dash ("-") is used
    
        Returns: 
            string
        
        Examples:
            > String.repeat("-", 5);     // "-----"
            > String.repeat("hello", 3); // "hellohellohello"
    */

    repeat: function(str, count)
    {
    	var ret = '';

    	for (var i=0; i<count; i++)
    		ret += str;
	
    	return ret;
    },
    
    wrapToLines: function(str, lineLength)
    {
        var lines = [];
        var line = '';
        var words = str.split(" ");
        var appended;
        var word;
        
        for (var i=0; i<words.length; i++)
        {
            word = words[i];
            appended = line + ( line.length == '' ? '' : ' ' ) + word;
            
            
            if ( appended.length > lineLength )
            {
                lines[lines.length] = appended;
                line = '';
            }
            else
            {
                line = appended;
            }
        }
        
        if (line != '')
            lines[lines.length] = appended;
        
        return lines;
    },

    /*
        Method: right
            gets the *specified number of characters from the end* of a given string
            
        Arguments:
            str - String, a given string 
            length - the number of characters to return
        
        Example:
            > Jel.String.right("wicked", 3); // "ked"
    */
            
    right: function(str, length)
    {
	    return str.substring(str.length - length, str.length);
	},

    /*
        Method: left
            gets the *specified number of characters from the beginning* of a given string
            
        Arguments:
            str - String, a given string 
            length - the number of characters to return
        
        Example:
            > Jel.String.left("wicked", 4); // "wick"
    */
	
	left: function(str, length)
    {
    	return str.substring(0, length);
    },
    
    /*
        Method: ltrim
            *removes whitespace* characters *from the beginning* of a given string

        Arguments:
            str - String, a given string 
        
        Examples:
            > Jel.String.lrim("  wicked");      // "wicked"
            > Jel.String.lrim("  wicked  ");    // "wicked  "
    */
	
    ltrim: function(str)
    {
    	return str.replace(/^\s+/,'');
    },

    /*
        Method: rtrim
            *removes whitespace* characters *from the end* of a given string

        Arguments:
            str - String, a given string 
        
        Examples:
            > Jel.String.rtrim("wicked");       // "wicked"
            > Jel.String.rtrim("  wicked  ");   // "  wicked"
    */
    
    rtrim: function(str)
    {
    	return str.replace(/\s+$/,'');
    },

    /*
        Method: trim
            *removes whitespace* characters *from the beginning and end* of a given string

        Arguments:
            str - String, a given string 
        
        Example:
            > Jel.String.trim("   wicked  "); // "wicked"
    */
    
    trim: function(str) 
    {
    	return Jel.String.ltrim(Jel.String.rtrim(str));
    },
    
    /*
        Method: toFloat
            *gets the float value* of a given string in manner *safe for arithmetic expressions*

        Arguments:
            str - String, a given string 
        
        Returns: 
            float - the float value of the string, if it can be converted into one 
            0.0 - if the string does not represent a float

        Examples:
            > Jel.String.toFloat("0.5");                                  // 0.5
            > Jel.String.toFloat("word");                                 // 0.0
            > Jel.String.toFloat("0.6") + Jel.String.toFloat("word");     // 0.6

    */
    
    toFloat: function(str)
    {
    	if (isNaN(str))
    		return 0.0;
    	else
    		if (Jel.String.trim(str) == '')
    			return 0.0;
    		else
    			return parseFloat(str);
    },

    /*
        Method: toInt
            *gets the integer value* of a given string in a manner that is *safe for arithmetic expressions*

        Arguments:
            str - String, a given string 
        
        Returns: 
            integer - the integer value of the string, if it can be converted into one 
            0 - if the string does not represent an integer

        Examples:
            > Jel.String.toInt("4");          // 4
            > Jel.String.toInt("word");       // 0
            > Jel.String.toInt(8 + "word");   // 8

    */
    
    toInt: function(str)
    {
    	if (isNaN(str))
    		return 0;
    	else
    	{
    		if (Jel.String.trim(str) == '')
    			return 0;
    		else
    			return parseInt(str);
    	}
    },

    /*
        Method: extractInt
            *extracts the digits in a given string*, returning the *integer value* of them *joined together in sequence*

        Arguments:
            str - String, a given string 
        
        Returns: 
            integer - the integer value of the all of the digits joined together in a given string, if any are present 
            0 - otherwise                           

        Examples:
            > Jel.String.extractInt("4jkbn45");   // 445
            > Jel.String.extractInt("word");      // 0
            > Jel.String.extractInt("ff88f999");  // 88999

    */
    
    extractInt: function(str)
    {
        var ret = "";

        var matches = str.match(/[0-9]+/ig);
    
        if (matches)
        {
            for (var i=0; i<matches.length; i++)
            {
                var part = "";
                
                for (var j=0; j<matches[i].length; j++)
                {
                    if (!(part.length == 0 && matches[i][j] == '0'))
                    {
                        // ignore leading zeros
                        part += matches[i][j];
                    }
                }
                
                ret += part;
            }
        }

        return ret == "" ? 0 : parseInt(ret);
    },

    /*
        Method: eq
            checks if a given string *is equal to another string*, with the *optional case-insensitive comparison*
        
        Arguments:
            str - String, a given string 
            strCompare - string, the string to compare to
            ignoreCase - boolean, whether the comparison is case sensitive or not
        
        Returns: 
            true - if they are equal 
            false - otherwise                           

        Examples:
            > Jel.String.equals("clay", "blah");        // false
            > Jel.String.equals("word", "WORD", true); // true
    */
    
    equals: function(str, strCompare, ignoreCase)
    {
        if (!ignoreCase)
            return str == strCompare;
        else
            return str.toLowerCase() == strCompare.toLowerCase();
    },
    
    /*
        Method: startsWith
            checks if a given string *begins with another string*, with the *optional case-insensitive comparison*

        Arguments:
            str - String, a given string 
            strCompare - string, the string to compare to
            ignoreCase - boolean, whether the comparison is case sensitive or not
        
        Returns: 
            true - if a given string begins with *str* 
            false - otherwise                    

        Examples:
            > Jel.String.startsWith("word", "w");                       // true
            > Jel.String.startsWith("field-container", "FIELD", false); // true
            > Jel.String.startsWith("word", "p");                       // false
    */

    startsWith: function(str, strCompare, ignoreCase)
    {   
        return Jel.String.equals(Jel.String.left(str, strCompare.length), strCompare, ignoreCase);
    },
 
    /*
        Method: endsWith
            checks if a given string *ends with another string*, with the option of a case-insensitive comparison

        Arguments:
            str - String, a given string 
            strCompare - string, the string to compare to
            ignoreCase - boolean, whether the comparison is case sensitive or not
        
        Returns: 
            true - if a given string ends with *str* 
            false - otherwise                    

        Examples:
            > Jel.String.endsWith("word", "w");                           // false
            > Jel.String.endsWith("field-container", "CONTAINER", false); // true
    */
    
    endsWith: function(str, strCompare, ignoreCase)
    {
        return Jel.String.equals(Jel.String.right(str, strCompare.length), strCompare, ignoreCase);
    },

    /*
        Method: decamelize
            *breaks a given string up into* a string of *lowercase delimited words*, where an uppercase letter in *a given string* denotes a new word (*camel case*)

        Arguments:
            str - String, the string to decamelize
            delimiter - String, the delimiter to use between words. If not specified, a dash ("-") is used
        
        Returns: 
            string - the final delimited words string
            
        Examples:
            > Jel.String.decamelize("fieldValidator");   // "field-validator"
            > Jel.String.decamelize("helloThere", " ");  // "hello there"
            > Jel.String.decamelize("getValue", "_");    // "get_value"
    */

    decamelize: function(str, delimiter)
    {
        var ret = str.replace(/([A-Z0-9])/g, (delimiter ? delimiter : '-') + '$1').toLowerCase();

        var re = new RegExp('([0-9])' + (delimiter ? delimiter : '-') + '([0-9])', 'g');

        while (ret.match(re))
        {
            ret = ret.replace(re, "$1$2");
        }

        return ret;    
    },

    /*
        Method: camelize
            converts a string of dash-delimited words into a camelized version

        Arguments:
            delimiter - the delimiter to use between words. If not specified, a dash ("-") is used
            
        Returns: 
            string - the final camel cased words string
        
        Credit:
            code taken from Prototype.js 1.5 (c) 2005-2007 Sam Stephenson
            
        Example:
            > Jel.String.camelize("field-validator"); // "fieldValidator"
    */
    
    camelize: function(str, delimiter) 
    {
        if (!delimiter)
            delimiter = '-';
            
        var parts = str.split(delimiter), len = parts.length;
        
        if (len == 1) 
            return parts[0];

        var camelized = str.charAt(0) == delimiter ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];

        for (var i = 1; i < len; i++)
        {
            camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
        }

        return camelized;
    },

    /*
        Method: titleCase
            converts a string of words into the equivalent title cased word

        Arguments:
            str - String, the string of words to convert
            
        Returns: 
            string - the final title-cased words string
            
        Example:
            > Jel.String.titleCase("field validator"); // "Field Validator"
    */

    titleCase: function(str)
    {
        var words = str.split(" ");
        var titleWords = [];
        
        for (var i=0; i<words.length; i++)
        {
            titleWords[titleWords.length] = words[i].substr(0, 1).toUpperCase() + words[i].substr(1, words[i].length - 1);
        }
        
        return titleWords.join(" ");
    },
    
    /*
        Method: normalize
            converts a string of words which are camel-cased, dash-delimited, underscore delimted, or a combination into a string of dash-delimited words

        Arguments:
            str - String, the string of words to convert
            
        Returns: 
            string - the final dash-delimited words string
            
        Example:
            > Jel.String.normalize("fieldValidator_1"); // "field-validator-1"
    */
    
    normalize: function(str)
    {
        var ret = str;
        
        ret = ret.replace(/\_/g, "-");
        ret = Jel.String.camelize(ret);
        ret = Jel.String.decamelize(ret);
        
        return ret;
    },

    /*
        Method: constant
            converts a string of words which are camel-cased, dash-delimited, underscore delimted, or a combination into a style approprite for constant values, that is, a string of underscore-delimited uppercase words

        Arguments:
            str - String, the string of words to convert
            
        Returns: 
            string - the final uppercase underscore-delimited words string
            
        Example:
            > Jel.String.normalize("fieldValidator_1"); // "FIELD_VALIDATOR_1"
    */
    
    constant: function(str)
    {
        return Jel.String.normalize(str).toUpperCase().replace(/\-/g, "_");
    }
};/*

Class: Jel.Date
    *Utility Methods* for manipulating JavaScript's *built-in Date class*
*/

Jel.Date = {};

Jel.Date.DATE_NOW = "now";

Jel.Date.PARSE_REG_EXP_COMMON =
{
    LEADING_1_12:       "10|11|12|(?:0[1-9])",
    NO_LEADING_1_12:    "10|11|12|(?:[1-9])",
    BOTH_0_59:          "[0-5][0-9]" 
};

    
/* 
    Property: FORMAT 
        a *hash* collection of *common formatting string constants* to be used with <Jel.Date.format> and <Jel.Date.parse>
        
    Examples:
        > Jel.Date.format(Jel.Date.parse("23/02/2006", Jel.Date.FORMAT.UK), Jel.Date.FORMAT.US);
        > // "02/23/2006"
        >
        > Jel.Date.format(Jel.Date.parse("23/02/2006 11:50 PM", Jel.Date.FORMAT.UK_12), Jel.Date.FORMAT.UTC);
        > // "2006-23-02 23:50:00"

    Available constants:
        > T_12:                     'g:i A' 
        > T_24:                     'G:i' 
        > T_MILITARY:               'Gi'
        > UK:                       'd/m/Y'
        > US:                       'm/d/Y'
        > UK_12:                    'd/m/Y g:i A'
        > US_12:                    'm/d/Y g:i A'
        > UK_24:                    'd/m/Y G:i'
        > US_24:                    'm/d/Y G:i'
        > UK_12_SHORT:              'd/m/Y g A'
        > US_12_SHORT:              'm/d/Y g A'
        > UK_24_SHORT:              'd/m/Y G'
        > US_24_SHORT:              'm/d/Y G'
        > UK_12_LONG:               'd/m/Y g:i:s A'
        > US_12_LONG:               'm/d/Y g:i:s A'
        > UK_24_LONG:               'd/m/Y G:i:s'
        > US_24_LONG:               'm/d/Y G:i:s'
        > UTC:                      'Y-m-d G:i:s'
        > UTC_T:                    'Y-m-dTG:i:s'
        > UTC_Y:                    'Y'
        > UTC_YM:                   'Y-m'
        > UTC_YMD:                  'Y-m-d'
        > UTC_YMDHM:                'Y-m-d g:i'
        > UTC_YMDHMS:               'Y-m-d g:i:s'
        > SHORT_MONTH:              'd M Y',
        > SHORT_MONTH_12:           'd M Y g:i A'
        > SHORT_MONTH_24:           'd M Y G:i'
        > SHORT_MONTH_PHRASE:       'jS M Y'
        > SHORT_MONTH_PHRASE_12:    'jS M Y g:i A'
        > SHORT_MONTH_PHRASE_24:    'jS M Y G:i'

    See also:
        <http://www.w3.org/TR/NOTE-datetime> has more information about the UTC (Coordinated Universal Time) standard formats
*/

Jel.Date.FORMAT =
{ 
    T_12:           'g:i A', 
    T_24:           'G:i', 
    T_MILITARY:     'Gi',
    UK:             'd/m/Y',
    US:             'm/d/Y',
    UK_12:          'd/m/Y g:i A',
    US_12:          'm/d/Y g:i A',
    UK_24:          'd/m/Y G:i',
    US_24:          'm/d/Y G:i',
    UK_12_SHORT:    'd/m/Y g A',
    US_12_SHORT:    'm/d/Y g A',
    UK_24_SHORT:    'd/m/Y G',
    US_24_SHORT:    'm/d/Y G',
    UK_12_LONG:     'd/m/Y g:i:s A',
    US_12_LONG:     'm/d/Y g:i:s A',
    UK_24_LONG:     'd/m/Y G:i:s',
    US_24_LONG:     'm/d/Y G:i:s',
    UTC:            'Y-m-d G:i:s',
    UTC_T:          'Y-m-dTG:i:s',
    UTC_Y:          'Y',
    UTC_YM:         'Y-m',
    UTC_YMD:        'Y-m-d',
    UTC_YMDHM:      'Y-m-d g:i',
    UTC_YMDHMS:     'Y-m-d g:i:s',
    SHORT_MONTH:    "d M Y",
    SHORT_MONTH_12: "d M Y g:i A",
    SHORT_MONTH_24: "d M Y G:i",
    SHORT_MONTH_PHRASE: "jS M Y",
    SHORT_MONTH_PHRASE_12: "jS M Y g:i A",
    SHORT_MONTH_PHRASE_24: "jS M Y G:i"
};

/* 
    Property: HUMAN_FORMAT 
        a hash collection of *common date format string constants* as usually *expressed by humans*, with each constant being equivalent to those in <Jel.Date.FORMAT>

    Available constants:
        > T_12:                     'h:mm AM/PM' 
        > T_24:                     'hh:mm (24 hour)'
        > T_MILITARY:               'hmm (military time)' 
        > UK:                       'dd/mm/yyyy'
        > US:                       'mm/dd/yyyy'
        > UK_12:                    'dd/mm/yyyy h:mm AM/PM'
        > US_12:                    'mm/dd/yyyy h:mm AM/PM'
        > UK_24:                    'dd/mm/yyyy hh:mm (24 hour)'
        > US_24:                    'mm/dd/yyyy hh:mm (24 hour)'
        > UK_12_SHORT:              'dd/mm/yyyy h AM/PM'
        > US_12_SHORT:              'mm/dd/yyyy h AM/PM'
        > UK_24_SHORT:              'dd/mm/yyyy h (24 hour)'
        > US_24_SHORT:              'mm/dd/yyyy h (24 hour)'
        > UK_12_LONG:               'dd/mm/yyyy h:mm:ss AM/PM'
        > US_12_LONG:               'mm/dd/yyyy h:mm:ss AM/PM'
        > UK_24_LONG:               'dd/mm/yyyy h:mm:ss (24 hour)'
        > US_24_LONG:               'mm/dd/yyyy h:mm:ss (24 hour)'
        > UTC:                      'yyyy-mm-dd hh:mm:ss (24 hour)'
        > UTC:                      'yyyy-mm-dd hh:mm:ss (24 hour)'
        > UTC_T:                    'yyyy-mm-ssThh:mm:ss (24 hour)'
        > UTC_Y:                    'yyyy'
        > UTC_YM:                   'yyyy-mm'
        > UTC_YMD:                  'yyyy-mm-dd'
        > UTC_YMDHM:                'yyyy-mm-dd hh:mm (24 hour)'
        > UTC_YMDHMS:               'yyyy-mm-dd hh:mm:ss (24 hour)'
        > SHORT_MONTH:              "dd mmm yyyy"
        > SHORT_MONTH_12:           "dd mmm yyyy hh:mm AM/PM"
        > SHORT_MONTH_24:           "dd mmm yyyy hh:mm (24 hour)"
        > SHORT_MONTH_PHRASE:       "d(th) mmm yyyy"
        > SHORT_MONTH_PHRASE_12:    "d(th) mmm yyyy hh:mm AM/PM"
        > SHORT_MONTH_PHRASE_24:    "d(th) mmm yyyy hh:mm (24 hour)"

*/
    
Jel.Date.HUMAN_FORMAT = 
{
    T_12:           'h:mm AM/PM', 
    T_24:           'h:mm (24 hour)', 
    T_MILITARY:     'hmm (military time)',
    UK:             'dd/mm/yyyy',
    US:             'mm/dd/yyyy',
    UK_12:          'dd/mm/yyyy h:mm AM/PM',
    US_12:          'mm/dd/yyyy h:mm AM/PM',
    UK_24:          'dd/mm/yyyy hh:mm (24 hour)',
    US_24:          'mm/dd/yyyy hh:mm (24 hour)',
    UK_12_SHORT:    'dd/mm/yyyy h AM/PM',
    US_12_SHORT:    'mm/dd/yyyy h AM/PM',
    UK_24_SHORT:    'dd/mm/yyyy h (24 hour)',
    US_24_SHORT:    'mm/dd/yyyy h (24 hour)',
    UK_12_LONG:     'dd/mm/yyyy h:mm:ss AM/PM',
    US_12_LONG:     'mm/dd/yyyy h:mm:ss AM/PM',
    UK_24_LONG:     'dd/mm/yyyy h:mm:ss (24 hour)',
    US_24_LONG:     'mm/dd/yyyy h:mm:ss (24 hour)',
    UTC:            'yyyy-mm-dd hh:mm:ss (24 hour)',
    UTC:            'yyyy-mm-dd hh:mm:ss (24 hour)',
    UTC_T:          'yyyy-mm-ssThh:mm:ss (24 hour)',
    UTC_Y:          'yyyy',
    UTC_YM:         'yyyy-mm',
    UTC_YMD:        'yyyy-mm-dd',
    UTC_YMDHM:      'yyyy-mm-dd hh:mm (24 hour)',
    UTC_YMDHMS:     'yyyy-mm-dd hh:mm:ss (24 hour)',
    SHORT_MONTH:    "dd mmm yyyy",
    SHORT_MONTH_12: "dd mmm yyyy hh:mm AM/PM",
    SHORT_MONTH_24: "dd mmm yyyy hh:mm (24 hour)",
    SHORT_MONTH_PHRASE: "d(th) mmm yyyy",
    SHORT_MONTH_PHRASE_12: "d(th) mmm yyyy hh:mm AM/PM",
    SHORT_MONTH_PHRASE_24: "d(th) mmm yyyy hh:mm (24 hour)"
};

Jel.Date.PARSE_REG_EXP = 
{
    d: "30|31|(?:[0-2][0-9])",
    D: Jel.Lang.Date.DAYS_SHORT.join("|"),
    j: "30|31|(?:[12]?[0-9])",
    l: Jel.Lang.Date.DAYS.join("|"),
    N: "[1-7]",
    S: "st|nd|rd|th",
    W: "50|51|52|(?:[1234]?[0-9])",
    F: Jel.Lang.Date.MONTHS.join("|"),
    m: Jel.Date.PARSE_REG_EXP_COMMON.LEADING_1_12,
    M: Jel.Lang.Date.MONTHS_SHORT.join("|"),
    n: Jel.Date.PARSE_REG_EXP_COMMON.NO_LEADING_1_12,
    t: "28|29|30|31",
    Y: "[0-9]{4}",
    y: "[0-9]{2}",
    a: "am|pm",
    A: "AM|PM",
    B: "[0-9]{1,3}",
    g: Jel.Date.PARSE_REG_EXP_COMMON.NO_LEADING_1_12,
    G: "20|21|22|23|(?:[1]?[1-9])",
    h: Jel.Date.PARSE_REG_EXP_COMMON.LEADING_1_12,
    H: "20|21|22|23|(?:[01]?[1-9])",
    i: Jel.Date.PARSE_REG_EXP_COMMON.BOTH_0_59,
    s: Jel.Date.PARSE_REG_EXP_COMMON.BOTH_0_59
};

Jel.Date.PARSE_REG_EXP.c = Jel.Date.PARSE_REG_EXP.Y + "\-" + Jel.Date.PARSE_REG_EXP.m + "\-" + Jel.Date.PARSE_REG_EXP.d + "T" + Jel.Date.PARSE_REG_EXP.H + ":" + Jel.Date.PARSE_REG_EXP.i + ":" + Jel.Date.PARSE_REG_EXP.s;
        
/*
    Method: parse
        *parses a date string* into a JavaScript Date object *assuming a specified date format*.
        
    Arguments:
        str - string, the string to parse.
        format - string, describes the format of the input string.
                Note that this can contain any arbritrary characters except the reserved formatting characters listed below 
                (these characters are based on formatting characters used for in the *PHP date function*)
    
    Example:
        > Jel.Date.parse("23/04/2006", "d/m/Y");
        > // [Date object with day = 23, month = 3, year = 2006]
        >  
        > Jel.Date.parse("23 Feb 2006", "d/m/Y");
        > // false, not in expected format  
    
    Returns:
        Date object - if the date string is in the specified format, and it is a real date in the Gregorian calendar
        false - otherwise
        
    Formatting characters:
    >   d  Day of the month, 2 digits with leading zeros:                       01 - 31
    >   D  A textual representation of a day, three letters:                    Mon - Sun
    >   j  Day of the month without leading zeros:                              1 - 31
    >   l  A full textual representation of the day of the week:                Sunday - Saturday
    >   S  English ordinal suffix for the day of the month, 2 characters:       st, nd, rd or th.
    >   F  A full textual representation of a month, such as January or March:  January - December
    >   m  Numeric representation of a month, with leading zeros:               01 - 12
    >   M  A short textual representation of a month, three letters:            Jan - Dec
    >   n  Numeric representation of a month, without leading zeros:            1 - 12
    >   Y  A full numeric representation of a year, 4 digits: Examples:         1999 or 2003
    >   y  A two digit representation of a year:                                Examples:  99 or 03
    >   a  Lowercase Ante meridiem and Post meridiem:                           am / pm 
    >   A  Uppercase Ante meridiem and Post meridiem:                           AM / PM
    >   g  12-hour format of an hour without leading zeros:                     1 - 12
    >   G  24-hour format of an hour without leading zeros:                     0 - 23
    >   h  12-hour format of an hour with leading zeros:                        01 - 12 
    >   H  24-hour format of an hour with leading zeros:                        00 - 23 
    >   i  Minutes with leading zeros:                                          00 - 59 
    >   s  Seconds, with leading zeros:                                         00 - 59

    See also: 
        <Jel.Date.format>, <Jel.Date.FORMAT>
*/

Jel.Date.parse = function(str, format)
{
    // first task is to check that the date is formatted as specified in format
    // any deviations from this format will result in parse failure
    
    // build the equivalent regular expression pattern from the format string
    
    var matchIndices = new Object(); 
    
    var now = new Date();
    
    var day = now.getDate();
    var month = now.getMonth();
    var year = Jel.Date.fullYear(now);
    
    var hour = 0;
    var minute = 0;
    var second = 0;
    var meridiem = 'AM';
    
    var pattern = '';
    
    for (var i=0; i<format.length; i++)
    {
        var part = format.charAt(i);
        
        var matchKey = '';
        
        // record parts of the string that represent day, month, year, so that we can check combinational validity
        switch (part)
        {
            case 'd':
            {
            }
            case 'j':
            {
                matchKey = 'day';
                break;
            }
            case 'm':
            case 'F':
            case 'M':
            case 'n':
            {
                matchKey = 'month';
                break;
            }
            case 'y':
            case 'Y':
            {
                matchKey = 'year';
                break;
            }
            case 'g':
            case 'G':
            case 'h':
            case 'H':
            {
                matchKey = 'hour';
                break;
            }
            case 'i':
            {
                matchKey = 'minute';
                break;
            }
            case 's':
            {
                
                matchKey = 'second';
                break;
            }
            case 'a':
            case 'A':
            {
                matchKey = 'meridiem';
                break;
            }
            
        }

        //debugger;
        
        if (matchKey)
            matchIndices[matchKey] = { index: i + 1, format: part };
    
        var pre = Jel.Date.PARSE_REG_EXP[part];
    
        if (pre)
            pattern = pattern + "(" + pre + ")";
        else
            pattern = pattern + "(" + part + ")";
    }
    
    var matches = str.match(new RegExp(pattern, "i"));
    
        
    if (matches)
    {
        // only check further for a real date if our format appears correct
        
        if (matchIndices['day'] && matchIndices['month'] && matchIndices['year'])
        {
            // check that the date is valid by extracting all parts
            day = Jel.String.extractInt(matches[matchIndices['day'].index]);
            
            if (matchIndices['month'].format == 'F')
                month = Jel.Lang.Date.MONTHS_LCASE.indexOf(matches[matchIndices['month'].index].toLowerCase());
            else if (matchIndices['month'].format == 'M')
                month = Jel.Lang.Date.MONTHS_SHORT_LCASE.indexOf(matches[matchIndices['month'].index].toLowerCase());
            else
                month = Jel.String.extractInt(matches[matchIndices['month'].index]) - 1;
        
            if (matchIndices['year'].format == 'Y')
                year = Jel.String.extractInt(matches[matchIndices['year'].index]);
            else
            {
                var yearValue = Jel.String.extractInt(matches[matchIndices['year'].index]);
            
                if (yearValue >= 69)
                {
                    year = Jel.String.extractInt("19" + Jel.Number.leadingZero(yearValue));
                }
                else
                {
                    year = Jel.String.extractInt("20" + Jel.Number.leadingZero(yearValue));
                }
            }    

            if (!Jel.Date.validDayMonthYear(day, month, year))
                return false;
        }
        
        // now check for any time components
        
        if (matchIndices['meridiem'])
            meridiem = matches[matchIndices['meridiem'].index].toUpperCase();
        
        if (matchIndices['hour'])
        {
            hour = Jel.String.extractInt(matches[matchIndices['hour'].index]);

            if (matchIndices['hour'].format == 'g' || matchIndices['hour'].format == 'h')
            {
                // consider the meridiem
                
                if (meridiem == 'AM')
                {
                    if (hour == 12)
                        hour = 0;
                }
                else
                {
                    if (hour != 12)
                        hour = hour + 12;
                }
            }   
        }
        
        
        if (matchIndices['minute'])
            minute = Jel.String.extractInt(matches[matchIndices['minute'].index]);

        if (matchIndices['second'])
            second = Jel.String.extractInt(matches[matchIndices['second'].index]);
        
        return new Date(year, month, day, hour, minute, second);
    }

    return false; 
};

/*
    Method: format
        formats the given date as a string using the date format in *format*.
        
    Arguments:
        date   - Date, the date to format
        format - string, describes the format of the output string using the reserved formatting characters listed below. Any other
                characters present will simply appear in the output string in the same place. 
    
    Returns:
        string - containing the formatted date
    
    Example:
        > Jel.Date.format(new Date(2007, 2, 2), "d/m/Y"); // 02/03/2007  
        > Jel.Date.format(new Date(2007, 2, 2), "jS M Y"); // 2nd March 2007  
    
    Formatting characters (based on formatting characters used in the *PHP date function*):

    >   d	Day of the month, 2 digits with leading zeros:                      01 - 31
    >   D	A textual representation of a day, three letters:                   Mon - Sun
    >   j	Day of the month without leading zeros:                             1 - 31
    >   l   A full textual representation of the day of the week:               Sunday - Saturday
    >   N   ISO-8601 numeric representation of the day of the week:             1 (for Monday) - 7 (for Sunday)
    >   S	English ordinal suffix for the day of the month, 2 characters:      st, nd, rd or th.
    >   w	Numeric representation of the day of the week:                      0 (for Sunday) - 6 (for Saturday)
    >   z	The day of the year (starting from 0):                              0 - 365
    >   F	A full textual representation of a month:	                        January - December
    >   m	Numeric representation of a month, with leading zeros:              01 - 12
    >   M	A short textual representation of a month, three letters:           Jan - Dec
    >   n	Numeric representation of a month, without leading zeros:           1 - 12
    >   t	Number of days in the given month:                                  28 - 31
    >   L	Whether it's a leap year:                                           1 (leap year), 0 (otherwise). 
    >   Y	A full numeric representation of a year, 4 digits:                  Examples: 1999 or 2003
    >   y	A two digit representation of a year:                               Examples: 99 or 03
    >   a	Lowercase Ante meridiem and Post meridiem:                          am / pm 
    >   A	Uppercase Ante meridiem and Post meridiem:                          AM / PM
    >   B	Swatch Internet time:                                               000 through 999
    >   g	12-hour format of an hour without leading zeros:                    1 - 12
    >   G	24-hour format of an hour without leading zeros:                    0 - 23
    >   h	12-hour format of an hour with leading zeros:                       01 - 12 
    >   H	24-hour format of an hour with leading zeros:                       00 - 23 
    >   i	Minutes with leading zeros:                                         00 - 59 
    >   s	Seconds, with leading zeros:                                        00 - 59
    >   c	ISO 8601 date:                                                      Example: 2004-02-12T15:19:21+00:00 
    >   r	RFC 2822 formatted date:                                            Example - Thu, 21 Dec 2000 16:01:07 +0200

    See also: <Jel.Date.parse>, <Jel.Date.FORMAT>
*/

Jel.Date.format = function(date, format)
{
	var ret = '';
    
	for (var i=0; i<format.length; i++)
	{	
		var chr = format.charAt(i);

		switch (chr)
		{
			case 'd' :
			{
				ret += Jel.Number.leadingZero(date.getDate());
				break;
			}
			case 'D' :
			{
				ret += Jel.Lang.Date.DAYS_SHORT[date.getDay()];
				break;
			}	
			case 'j' :
			{
				ret += date.getDate();
				break;
			}
			case 'l' :
			{
				ret += Jel.Lang.Date.DAYS[date.getDay()];
				break;
			}
			case 'N' :
			{
				var date = date.getDate();
				ret += (date == 0 ? 7 : date);
				break;
			}	
			case 'S' :
			{
				ret += Jel.Date.ordinalSuffix(date.getDate());
				break;
			}	
			case 'w' :
			{
				ret += date.getDate();
				break;
			}
			case 'z' :
			{
				ret += Jel.Date.dayOfYear(date);
				break;
			}
			case 'F' :
			{
				ret += Jel.Lang.Date.MONTHS[date.getMonth()];
				break;
			}
			case 'm' :
			{
				ret += Jel.Number.leadingZero(date.getMonth() + 1);
				break;
			}
			case 'M' :
			{
				ret += Jel.Lang.Date.MONTHS_SHORT[date.getMonth()];
				break;
			}
			case 'n' :
			{
				ret += date.getMonth() + 1;
				break;
			}
			case 't' :
			{
				ret += Jel.Date.daysInMonth(date.getMonth(), Jel.Date.fullYear(date));
				break;
			}
			case 'L' :
			{
				ret += Jel.Date.isLeapYear(Jel.Date.fullYear(date)) ? 1 : 0;
				break;
			}
			case 'Y' :
			{
				ret += Jel.Date.fullYear(date);
				break;
			}
			case 'y' :
			{
				ret += Jel.Date.fullYear(date).toString().substr(2, 2);
				break;
			}
			case 'a' :
			{
				ret += Jel.Date.meridiem(date.getHours());
				break;
			}
			case 'A' :
			{
				ret += Jel.Date.meridiem(date.getHours()).toUpperCase();
				break;
			}
			case 'B' :
			{
				ret += Jel.Date.internetBeat(date);
				break;
			}
			case 'g' :
			{
				ret += Jel.Date.twelveHour(date.getHours());
				break;
			}
			case 'G' :
			{
				ret += date.getHours();
				break;
			}
			case 'h' :
			{
				ret += Jel.Number.leadingZero(Jel.Date.twelveHour(date.getHours()));
				break;
			}
			case 'H' :
			{
				ret += Jel.Number.leadingZero(date.getHours());
				break;
			}
			case 'i' :
			{
				ret += Jel.Number.leadingZero(date.getMinutes());
				break;
			}
			case 's' :
			{
				ret += Jel.Number.leadingZero(date.getSeconds());
				break;
			}
			case 'c' :
			{
				ret += Jel.Date.format(date, 'Y-m-dTH:i:s');
				break;
			}
			case 'r' :
			{
				ret += date.toString();
				break;
			}

			default: 
				ret += chr;
    	}
    }
    
	return ret;
};

/*
    Method: convert
        converts a *date string from one format to another*. Essentially performs <Jel.Date.parse> on a given string, followed by <Jel.Date.format> on the return date object
        
    Arguments:
        str - string, the original date string to parse
        fromFormat - the expected format of the date in *str* (refer to <Jel.Date.parse> for valid formatter characters)
        toFormat - the desired output format  (refer to <Jel.Date.format> for valid formatter characters)
    
    Returns:
        string - the formatted date, if both the original date string was in the expected format, and the parsed date was a real date
        false - otherwise 
    
    Examples:
        > Jel.Date.convert("28 Feb 2006 2PM", "j M Y gA", Jel.Date.FORMAT.UK_12);        
        > // "28/02/2006 2:00 PM"
        >
        > Jel.Date.convert("30/04/2007 10:00 PM", Jel.Date.FORMAT.US_12, "js M Y, gA");  
        > // "30th April 2007, 10PM"
        >
        > Jel.Date.convert("31/02/2007 10:00 PM", Jel.Date.FORMAT.US_12, "js M Y, gA");  
        > // false, form format correct, but not a real date
        >
        > Jel.Date.convert("31st March 2006", "d/m/Y", "js M Y, gA");                
        > // false, from format is incorrect
*/

Jel.Date.convert = function(str, fromFormat, toFormat)
{
    var date = Jel.Date.parse(str, fromFormat);
    
    if (date)
        return Jel.Date.format(date, toFormat);
        
    return false;
};

 /*
    Method: now
        gets a *Date object* representing the *current date*, with an optional *format* string. 
        
    Arguments:
        format - String (optional), if provided, will return a string of the current date in this format , using <Jel.Date.format>
    
    Returns:
        Date - if format is not specified
        String - otherwise
*/

Jel.Date.now = function(format)
{
    if (format)
    {
        return Jel.Date.format(new Date(), format);
    }
    else
    {
        return new Date();
    }
};

 /*
    Method: daysInMonth
        gets the *number of days* for a *given month* and *year*.

    Arguments:
        month - integer, the month of the year 0-11 (not 1-12, as standard in JavaScript)
        year - integer, the 4 digit year
        
    Returns:
        integer
    
    Examples: 
        > Jel.Date.daysInMonth(2, 2006); // 31
*/

Jel.Date.daysInMonth = function(month, year)
{
    switch (month)
	{
		case 8:
		case 3:
		case 5:
		case 10:
		{
			return 30;
			break;
		}
		case 1:
	    {
			return (Jel.Date.isLeapYear(year) ? 29 : 28);
			break;
		}
		default:
		{
			return 31;
		}
	}
};

 /*
    Method: isLeapYear
        checks *if a given year* is a *leap year*

    Arguments:
        year - integer, the 4 digit year
        
    Returns:
        true - if the year is a leap year
        false - otherwise
    
    Examples: 
        > Jel.Date.isLeapYear(2004); // true
        > Jel.Date.isLeapYear(2006); // false
*/

Jel.Date.isLeapYear = function(year)
{
    return year % 4 == 0;
};

 /*
    Method: validDayMonthYear
        checks *if a given day, month, and year* combination is a *valid date* in the Gregorian calendar

    Arguments:
        month - integer, the month of the year 0-11 (not 1-12, as standard in JavaScript)
        year - integer, the 4 digit year
        
    Returns:
        true - if the combination is a valid day, month, and year combination
        false - otherwise
*/

Jel.Date.validDayMonthYear = function(day, month, year)
{
    if (isNaN(day) || isNaN(month) || isNaN(year))
        throw("day, month, and year must all be integer values");
        
    return day > 0 && day <= Jel.Date.daysInMonth(month, year);
};

 /*
    Method: meridiem
        gets the *ante/post meridiem* (*am* or *pm*) for a *given hour*

    Arguments:
        hour - integer, the hour of the day in 24-hour time (0-23) 
        
    Returns:
        string - "am" or "pm"
    
    Examples:
        > Jel.Date.meridiem(0); // "am"
        > Jel.Date.meridiem(5); // "am"
        > Jel.Date.meridiem(12); // "pm"
        > Jel.Date.meridiem(17); // "pm"
*/

Jel.Date.meridiem = function(hour)
{
	return hour < 12 ? 'am' : 'pm';    
};

/*
    Method: twelveHour
        gets the twelve hour value for the given *hour*
        
    Arguments:
        hour - integer an hour from 0-23 (24 hour time)
    
    Examples:
        >Jel.Date.twelveHour(0); // 12
        >Jel.Date.twelveHour(4); // 4
        >Jel.Date.twelveHour(12); // 12
        >Jel.Date.twelveHour(13); // 1
        >Jel.Date.twelveHour(18); // 6
*/

Jel.Date.twelveHour = function(hour)
{
    if (hour == 0)
        return 12;
    else if (hour > 12)
        return hour - 12;
    else
        return hour;
}; 

/*
    Method: ordinalSuffix
        gets the *English ordinal suffix* for a given day *(st, nd, rd, th)*
    
    Arguments:
        day - Integer

    Returns: 
        string
        
    See also: 
        <Jel.Number.ordinalSuffix>
    
    Example:
        Jel.Date.ordinalSuffix(5) // th
*/

Jel.Date.ordinalSuffix = function(day)
{
	return Jel.Number.ordinalSuffix(day);
};

/*
    Method: fullYear
        gets the *full 4-digit year* for *this* Date object

    Arguments:
        date - Date object

    Returns: integer
    
    Example:
        > Jel.Date.fullYear(new Date(2007, 6, 30));    // 2007

    Credit:
        Thanks to Peter-Paul Koch of http://www.quirksmode.org/ for the basis of this code
*/

Jel.Date.fullYear = function(date) 
{
    var x = date.getYear();

    var y = x % 100;

    y += (y < 38) ? 2000 : 1900;

    return y;
};

/*
    Method: dayOfYear
        gets the *day of the year* for the given date

    Arguments:
        date - Date object

    Returns: integer
        
    Example:
        > Jel.Date.dayOfYear(new Date(2007, 6, 30));    // 211
        
*/

Jel.Date.dayOfYear = function(date)
{
    var month = date.getMonth();
    var day = date.getDate();
    var daysElapsed = 0;
    
    for (var i=0; i<month; i++)
    {
        daysElapsed += Jel.Date.daysInMonth(i);
    }   
    
    return daysElapsed + day;
};

/*
    Method: internetBeat
        gets the *Swatch internet time* for the given date object 

    Arguments:
        date - Date object

    Returns: integer
    
    Example:
        > Jel.Date.internetBeat(new Date(2007, 06, 30, 20, 40, 0));    // 486

    Credit:
        Thanks to Peter-Paul Koch of http://www.quirksmode.org/ for this code
*/

Jel.Date.internetBeat = function(date)
{
	var off = (date.getTimezoneOffset() + 60)*60;

	var theSeconds = (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds() + off;

	var beat = Math.floor(theSeconds/86.4);

	if (beat > 1000) 
		beat -= 1000;

	if (beat < 0) 
		beat += 1000;

	return beat;
};

/*
Class: Jel.Number
    *Utility Methods* for manipulating JavaScript's *built-in Number class*
*/

Jel.Number = 
{
    /*
        Method: leadingZero
            gets a *string representation* for a given number *padded out with leading zeros to a given length*

        Arguments:
            number - Number, the number to append leading zeros to
            toLength - integer, optional, the total length of the final leading-zero-padded string. 
                      If not specified, defaults to a length of 2

        Examples:
            > Jel.Number.leadingZero(1);        // 01
            > Jel.Number.leadingZero(1, 3);     // 001
            > Jel.Number.leadingZero(10, 3);    // 010
            > Jel.Number.leadingZero(1000, 3);  // 1000

    */
    
    leadingZero: function(number, toLength)
    {
        return Jel.String.repeat('0', (toLength || 2) - number.toString().length) + number.toString();
    },

    /*
        Method: ordinalSuffix
            gets the English ordinal suffix for a given number *(st, nd, rd, th)*
    
        Arguments:
            number - Number, the value to get the ordinal suffix for
            
        Example:
            > Jel.Number.ordinalSuffix(2);    // "st"
            > Jel.Number.ordinalSuffix(2);    // "nd"
            > Jel.Number.ordinalSuffix(23);   // "rd"
            > Jel.Number.ordinalSuffix(11);   // "th"
            > Jel.Number.ordinalSuffix(14);   // "th"
    */

    ordinalSuffix: function(number)
    {
        var str = Math.round(number).toString();
        var rem = Math.round(number) % 10;
    
        // first, special case for teen numbers (which are always "th")
    
        if (Jel.String.right(str, 2))
            if (Jel.String.right(str, 2).length == 2 && Jel.String.left(Jel.String.right(str, 2), 1) == "1")
                return "th";
    
        switch (rem)
        {
            case 1:
            {
                return "st";
                break;
            }
            case 2:
            {
                return "nd";
                break;
            }
            case 3:
            {
                return "rd";
                break;
            }
            default:
                return "th";
        }
    },

    /*
        Method: format
            *formats a given number* in a *specified display format*

        Arguments:
            number - Number object, the number to format
            format - string, describes the format of the output string (see examples below)
    
        Returns:
            string - the formatted output string
        
        Examples:
            > Jel.Number.format(3129.95, "$#,###.##");  // $3,129.95   
            > Jel.Number.format(3129.95, "$####.##");   // $3129.95 	  
            > Jel.Number.format(329.95, "$#####.##");   // $329.95 	  
            > Jel.Number.format(329, "$###");           // $329 		  
            > Jel.Number.format(-329, "(###)");         // (329)		  
            > Jel.Number.format(-1234.95, "#,##0.##");  // -1,234.95	  
            > Jel.Number.format(0.01, "#.##");          // 01		  
            > Jel.Number.format(0.01, "#.###");         // 010		  
            > Jel.Number.format(0.01, "0.##");          // 0.01		  
            > Jel.Number.format(2, "00");               // 02		  
            > Jel.Number.format(2345, "00000");         // 02345		  
            > Jel.Number.format(45, "00000");           // 00045
        
        Formatting Rules:
            > # - substitutes for a number, but only if this position has a definite non-zero number here
            > 0 - substitutes for a number always, using zero if this position has no definite non-zero number here
        
    
    */

    format: function(number, format)
    {
        var formatted;
    	var formattedDec = '';
    	var formattedWhole = '';

    	var strWhole;

    	var value = Math.abs(number);
    	var valueWhole = Math.floor(value);

    	var formatter = format;

    	var parenthesis = false;

    	// check if negative values should use parenthesis formatting

    	var matches = formatter.match(/\((.*?)\)/, "ig");

    	if (matches && matches.length > 0)
    	{
    		parenthesis = true;

    		// take the rest of the string as the actual formatter
    		formatter = matches[1];
    	}

    	var formatterWhole = formatter;

    	var parts = formatter.split(".");

    	if (parts.length > 1)
    	{
    		// the string has a decimal part
    		value = value.toFixed(parts[1].length);	

    		formatterWhole = parts[0];
    	}
    	else
    	{
    		valueWhole = Math.round(value);	
    	}

    	// now work out how to format the whole number part
    	formatted = value.toString();

    	if (parts.length > 1)
    	{
    		formattedDec = "." + formatted.split(".")[1];
    	}

    	strWhole = Math.abs(valueWhole).toString();

    	// first, pad out formatterWhole up to the length of valueWhole, with #  

    	var count = 0;

    	formatterWhole.toArray().each
    	(
    		function (chr)
    		{
    			if (chr == '#' || chr == '0')
    				count++;
    		}
    	);

    	matches = formatterWhole.match(/[^#0,]*?([#0,]+)[^#0,]*?/);

    	if (matches.length > 1)
    	{
    		formatterWhole = formatterWhole.replace(matches[1], String.stringOfChar('#', strWhole.length - count) + matches[1]);
    	}

    	var formatterChars = formatterWhole.toArray();

    	var digitIndex = strWhole.length - 1;

    	for (var i = formatterChars.length - 1; i>=0; i--)
    	{
    		// process each character in the formatter string 

    		var chr = formatterChars[i];
    		var ten = Math.pow(10, strWhole.length - 1 - digitIndex);


    		if (chr == '#')
    		{
    			if (valueWhole >= ten)
    			{
    				formattedWhole = strWhole.substr(digitIndex, 1) + formattedWhole;
    			} 
    			// otherwise add nothing
    			digitIndex = digitIndex - 1;	
    		}
    		else if (chr == '0')
    		{
    			if (valueWhole >= ten)
    			{
    				formattedWhole = strWhole.substr(digitIndex, 1) + formattedWhole;
    			} 
    			else
    			{
    				// otherwise add a 0
    				formattedWhole = '0' + formattedWhole;
    			}
	
    			digitIndex = digitIndex - 1;
    		}
    		else if (chr == ',')
    		{
    			if (valueWhole >= ten)
    			{
    				formattedWhole = chr + formattedWhole;
    			}
    		}
    		else
    		{
    			formattedWhole = chr + formattedWhole;
    		}
    	}

    	// apply the parenthesis if the original value is negative

    	if (number < 0)
    	{
    		if (parenthesis)
    			return '(' + formattedWhole + formattedDec + ')';
    		else
    			return '-' + formattedWhole + formattedDec;
    	}

    	return (formattedWhole + formattedDec);
    }
};
