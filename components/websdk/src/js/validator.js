Object.extend(Appcelerator.Validator,
{
    toString: function ()
    {
        return '[Appcelerator.Validator]';
    },

    uniqueId: 0,
	names: [],
	
	addValidator: function(name, validator)
	{
		Appcelerator.Validator[name] = validator;
		Appcelerator.Validator.names.push(name);
	},

	URI_REGEX: /(ftp|http|https|file):(\/){1,2}(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
    ALPHANUM_REGEX: /^[0-9a-zA-Z]+$/,
    DECIMAL_REGEX: /^[-]?([1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|\.[0-9]{1,2})$/,
 	EMAIL_REGEX: /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,

	//
	// DATE VALIDATION UTILS
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
	}
	
});

(function(){
	
	var addValidator = Appcelerator.Validator.addValidator;
	
    addValidator('required', function(value)
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
    });

	addValidator('email_optional', function(value)
	{
		if (!value || value.trim().length == 0) return true;
		return Appcelerator.Validator.EMAIL_REGEX.test(value);		
	});

    addValidator('email', function(value)
    {
        return Appcelerator.Validator.EMAIL_REGEX.test(value);
    });

    addValidator('fullname_optional', function(value)
    {
        if (!value || value.trim().length == 0) return true;
        return Appcelerator.Validator.fullname(value);
    });

    addValidator('fullname', function(value)
    {
        // allow Jeffrey George Haynie or Jeff Haynie or Jeff Smith, Jr.
        return ((value.split(" ")).length > 1);
    });

    addValidator('noSpaces_optional', function(value)
    {
       if (!value) return true;
       return Appcelerator.Validator.noSpaces(value);
    });

    addValidator('noSpaces', function(value)
    {
        // also must have a value
        // check before we check for spaces
        if (!Appcelerator.Validator.required(value))
        {
            return false;
        }
        return value.indexOf(' ') == -1;
    });
 
    addValidator('password_optional', function (value)
    {
	   if (!value || value.trim().length == 0) return true;
       return Appcelerator.Validator.password(value);
    });

    addValidator('password', function (value)
    {
        return (value.length >= 6);
    });

    addValidator('number', function (value)
    {
		if (!value || value.trim().length == 0 || value < 0)return false;
		return Appcelerator.Validator.DECIMAL_REGEX.test(value);
		
	});

    addValidator('number_optional', function (value)
    {
		if (!value || value.trim().length == 0) return true;
		return Appcelerator.Validator.number(value);
	});

    addValidator('wholenumber_optional', function (value)
    {
		if (!value || value.trim().length == 0) return true;
		return Appcelerator.Validator.wholenumber(value);
	});
		
    addValidator('wholenumber', function (value)
    {
		if (!value || value < 0) return false;
		
		for (var i = 0; i < value.length; i++)
		{   
			var c = value.charAt(i);
		    if (((c < "0") || (c > "9"))) return false;
		}
		return true;
    });

    addValidator('url_optional', function (value)
    {
		if (!value || value.trim().length == 0)return true;
        return Appcelerator.Validator.url(value);
    });

    addValidator('url', function (value)
    {
      	return Appcelerator.Validator.URI_REGEX.test(value);
    });

    addValidator('checked', function (value)
    {
        return value || value == 'on';
    });

    addValidator('length', function (value, element)
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
    });
    
    addValidator('alphanumeric_optional', function (value,element)
    {
    	if (!value || value.trim().length ==0)return true;
		return Appcelerator.Validator.ALPHANUM_REGEX.test(value)==true;
    });
	
    addValidator('alphanumeric', function (value,element)
    {
    	return Appcelerator.Validator.ALPHANUM_REGEX.test(value)==true;
    });

	addValidator('date_optional', function(value)
	{
		if (!value || value.trim().length == 0)return true;
		return Appcelerator.Validator.date(value);
		
	});
	
	addValidator('date', function(value)
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
		var numberTest = month + "/" + day + "/" + year;
		if (value.indexOf(Appcelerator.dtCh,pos2+1)!=-1 || Appcelerator.Validator.number(Appcelerator.Validator.stripCharsInBag(numberTest, Appcelerator.Validator.dtCh))==false)
		{
			return false;
		}
		return true;
	});
})();

