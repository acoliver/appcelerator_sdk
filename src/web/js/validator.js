Appcelerator.Validator =
{
    toString: function ()
    {
        return '[Appcelerator.Validator]';
    },

    uniqueId: 0,
/*  THESE ARE NOT NECESSARSY NOW THAT WE HAVE VALIDATOR WIDGETS 
    actionValidatorDecorator: function (element, valid, decId, msg)
    {
        if (decId)
        {
            var div = $(decId);
            if (div)
            {
                if (!valid)
                {
                    div.innerHTML = '<img src="' + Appcelerator.Decorator.invalidImage + '"> ' + msg;
					Appcelerator.Compile.compile(div);
                }
                Element.setStyle(decId, {visibility:(valid ? 'hidden' : 'visible')});
            }
        }
        else
        {
            var id = 'decorate_' + element.id;
            var div = $(id);

            if (!div)
            {
                // only insert the first time through
                new Insertion.After(element.id, '<span id="' + id + '" style="font-size:11px" class="error_color"></span>');
                div = $(id);
            }

            if (!valid)
            {
                // update the message if not valid
                div.innerHTML = '<img src="' + Appcelerator.Decorator.invalidImage + '"/> ' + msg;
				Appcelerator.Compile.compile(div);
            }

            // just flip the visibility flag is valid or invalid - helps with shifting box when you remove/add
            Element.setStyle(id, {visibility:(valid ? 'hidden' : 'visible')});
        }
    },


    passwordsMatch: function(element, ids, decId)
    {
        var valid = false;

        if (ids)
        {
            var passwordValue = null;
            var retypeValue = null;
            var foundCount = 0;
            var self = this;

//FIXME: need to allow this to be dynamic and not hard coded to this name

            ids.split(',').each(function(n)
            {
                if (n == "user_password")
                {
                    passwordValue = $(n).value;
                    foundCount++;
                }
                if (n == "user_retype_password")
                {
                    retypeValue = $(n).value;
                    foundCount++;
                }
                if (foundCount == 2) throw $break;
            });
            valid = (passwordValue == retypeValue);
        }
        Appcelerator.Validator.actionValidatorDecorator(element, valid, decId, "passwords must match");
        return valid;
    },
*/
    required: function(value)
    {
       if (null == value)
        {
            return false;
        }
        if (typeof(value) == 'boolean')
        {
            return value;
        }
		value = ''+value;
        return value.trim().length > 0;
    },

    EMAIL_REGEXP: /^([a-zA-Z0-9_.+-])+@[a-zA-Z0-9-]+[\.]([a-zA-Z0-9]{2,6})([\.][a-zA-Z0-9]{2,6}){0,1}$/,

	email_optional: function(value)
	{
		if (!value || value.trim().length == 0) return true;
		return Appcelerator.Validator.EMAIL_REGEXP.test(value);		
	},

    email: function(value)
    {
        return Appcelerator.Validator.EMAIL_REGEXP.test(value);
    },

    fullname_optional: function(value)
    {
        if (!value || value.trim().length == 0) return true;
        return Appcelerator.Validator.fullname(value);
    },

    fullname: function(value)
    {
        // allow Jeffrey George Haynie or Jeff Haynie or Jeff Smith, Jr.
        return ((value.split(" ")).length > 1);
    },

   noSpaces_optional: function(value)
    {
       if (!value) return true;
       return Appcelerator.Validator.noSpaces(value);
    },

    noSpaces: function(value)
    {
        // also must have a value
        // check before we check for spaces
        if (!Appcelerator.Validator.required(value))
        {
            return false;
        }
        return value.indexOf(' ') == -1;
    },
 
   password_optional: function (value)
    {
	   if (!value || value.trim().length == 0) return true;
       return Appcelerator.Validator.password(value);
    },

    password: function (value)
    {
        return (value.length >= 6);
    },

    number: function (value)
    {
		if (!value || value.trim().length == 0)return false;
		
		for (var i = 0; i < value.length; i++)
		{   
			var c = value.charAt(i);
		    if (((c < "0") || (c > "9"))) return false;
		}
		return true;
	},

    number_optional: function (value)
    {
		if (!value || value.trim().length == 0) return true;
		return Appcelerator.Validator.number(value);
	},

    wholenumber_optional: function (value)
    {
		if (!value || value.trim().length == 0) return true;
		return Appcelerator.Validator.wholenumber(value);
	},
		
    wholenumber: function (value)
    {
        return (Appcelerator.Validator.number(value) && value >= 0);
    },

    uri_regexp: /(ftp|http|https|file):(\/){1,2}(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,

    url_optional: function (value)
    {
		if (!value || value.trim().length == 0)return true;
        return Appcelerator.Validator.url(value);
    },

    url: function (value)
    {
      	return Appcelerator.Validator.uri_regexp.test(value);
    },

    checked: function (value)
    {
        return value || value == 'on';
    },

    length: function (value, element)
    {
        if (value)
        {
            try
            {
                var min = parseInt(element.getAttribute('validatorMinLength') || '1');
                var max = parseInt(element.getAttribute('validatorMaxLength') || '999999');
                var v = value.length;
                return v >= min && v <= max;
            }
            catch (e)
            {
            }
        }
        return false;
    },
    
	ALPHANUM_REGEX: /^[0-9a-zA-Z]+$/,

    alphanumeric_optional: function (value,element)
    {
    	if (!value || value.trim().length ==0)return true;
		return Appcelerator.Validator.ALPHANUM_REGEX.test(value)==true;
    },
	
    alphanumeric: function (value,element)
    {
    	return Appcelerator.Validator.ALPHANUM_REGEX.test(value)==true;
    },

	//
	// BEGIN DATE VALIDATION 
	//
	dtCh:"/",
	minYear:1900,
	maxYear:2100,
	stripCharsInBag: function(s, bag)
	{
		var i;
	    var returnString = "";
	    for (i = 0; i < s.length; i++)
		{   
	        var c = s.charAt(i);
	        if (bag.indexOf(c) == -1) returnString += c;
	    }
	    return returnString;
	},
	daysInFebruary: function (year)
	{
	    return (((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28 );
	},
 	DaysArray: function(n) 
	{
		for (var i = 1; i <= n; i++) 
		{
			this[i] = 31
			if (i==4 || i==6 || i==9 || i==11) {this[i] = 30}
			if (i==2) {this[i] = 29}
	   } 
	   return this;
	},

	date_optional: function(value)
	{
		if (!value || value.trim().length == 0)return true;
		return Appcelerator.Validator.date(value);
		
	},
	date: function(value)
	{
		
		var daysInMonth = Appcelerator.Validator.DaysArray(12);
		var pos1=value.indexOf(Appcelerator.Validator.dtCh);
		var pos2=value.indexOf(Appcelerator.Validator.dtCh,pos1+1);
		var strMonth=value.substring(0,pos1);
		var strDay=value.substring(pos1+1,pos2);
		var strYear=value.substring(pos2+1);
		strYr=strYear;
		if (strDay.charAt(0)=="0" && strDay.length>1) 
			strDay=strDay.substring(1);
		if (strMonth.charAt(0)=="0" && strMonth.length>1) 
			strMonth=strMonth.substring(1);
		for (var i = 1; i <= 3; i++) 
		{
			if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1);
		}
		month=parseInt(strMonth);
		day=parseInt(strDay);
		year=parseInt(strYr);
		if (pos1==-1 || pos2==-1)
		{
			return false;
		}
		if (strMonth.length<1 || month<1 || month>12)
		{
			return false;
		}
		if (strDay.length<1 || day<1 || day>31 || (month==2 && day>Appcelerator.Validator.daysInFebruary(year)) || day > daysInMonth[month])
		{
			return false;
		}
		if (strYear.length != 4 || year==0 || year<Appcelerator.Validator.minYear || year>Appcelerator.Validator.maxYear)
		{
			return false;
		}
		if (value.indexOf(Appcelerator.dtCh,pos2+1)!=-1 || Appcelerator.Validator.number(Appcelerator.Validator.stripCharsInBag(value, Appcelerator.Validator.dtCh))==false)
		{
			return false;
		}
		return true;
	}
};

