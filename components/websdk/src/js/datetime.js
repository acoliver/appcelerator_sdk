

Appcelerator.Util.DateTime = Class.create();
Appcelerator.Util.DateTime =
{
    ONE_SECOND:1000,
    ONE_MINUTE: 60000,
    ONE_HOUR: 3600000,
    ONE_DAY: 86400000,
    ONE_WEEK: 604800000,
    ONE_MONTH: 18748800000, // this is rough an assumes 31 days
    ONE_YEAR: 31536000000,

	/**
	 * Convert a duration from the format: "2y 3w 5d 27m 13s" into milliseconds
	 */
	timeFormat: function (value)
	{
		var str = '';
		var time = 0;

		for (var c=0,len=value.length;c<len;c++)
		{
			var ch = value.charAt(c);
			switch (ch)
			{
				case ',':
				case ' ':
				{
					str = '';
					break;
				}
				case 'm':
				{
					if (c + 1 < len)
					{
						var nextch = value.charAt(c+1);
						if (nextch == 's')
						{
							time+=parseInt(str);
							c++;
						}
					}
					else
					{
						time+=parseInt(str) * this.ONE_MINUTE;
					}
					str = '';
					break;
				}
				case 's':
				{
					time+=parseInt(str) * this.ONE_SECOND;
					str = '';
					break;
				}
				case 'h':
				{
					time+=parseInt(str) * this.ONE_HOUR;
					str = '';
					break;
				}
				case 'd':
				{
					time+=parseInt(str) * this.ONE_DAY;
					str = '';
					break;
				}
				case 'w':
				{
					time+=parseInt(str) * this.ONE_WEEK;
					str = '';
					break;
				}
				case 'y':
				{
					time+=parseInt(str) * this.ONE_YEAR;
					str = '';
					break;
				}
				default:
				{
					str+=ch;
					break;
				}
			}
		}

		if (str.length > 0)
		{
			time+=parseInt(str);
		}

		return time;
	},
    getDurationNoFormat: function (begin, end)
	{
        end = end || new Date();
        var amount = end.getTime() - begin.getTime();

		var hours = 0
		var minutes = 0;
		var seconds = 0;

		if (amount > this.ONE_HOUR)
		{
			hours = Math.round(amount/this.ONE_HOUR);
			amount = amount - (this.ONE_HOUR * hours);
		}
		if (amount == this.ONE_HOUR)
		{
			hours = 1;
			amount = amount - this.ONE_HOUR;
		}
		if (amount > this.ONE_MINUTE)
		{
			minutes = Math.round(amount/this.ONE_MINUTE);
			amount = amount - (this.ONE_MINUTE * minutes);
		}
		if (amount == this.ONE_MINUTE)
		{
			minutes = 1;
			amount = amount - this.ONE_MINUTE;
		}
		if (amount > this.ONE_SECOND)
		{
			seconds = Math.round(amount/this.ONE_SECOND);
			amount = amount - (this.ONE_SECOND * seconds);
		}
		if (amount == this.ONE_SECOND)
		{
			seconds = 1;
		}
		if (seconds <10)
		{
			seconds = "0" + seconds;
		}

		if (hours > 0)
		{
			return hours + ":" + minutes + ":" + seconds;
		}

		if (minutes > 0)
		{
			return minutes + ":" + seconds;
		}

		if (seconds > 0)
		{
			return "0:" + seconds;
		}

		else return ":00";
	},
	getDuration: function (begin, end)
    {
        end = end || new Date();
        var amount = end.getTime() - begin.getTime();

		return this.toDuration(amount);
    },
    toDuration: function (amount)
    {
        amount = amount || 0;

		if (amount < 0)
        {
            return '0';
        }
        else if (amount < this.ONE_SECOND)
        {
            var calc = Math.round(amount / this.ONE_SECOND);
            return calc + ' ms';
        }
        else if (amount == this.ONE_SECOND)
        {
            return '1 second';
        }
        else if (amount < this.ONE_MINUTE)
        {
            var calc = Math.round(amount / this.ONE_SECOND);
            return calc + ' second' + (calc > 1 ? 's' : '');
        }
        if (amount == this.ONE_MINUTE)
        {
            return '1 minute';
        }
        else if (amount == this.ONE_HOUR)
        {
            return '1 hour';
        }
        else if (amount < this.ONE_HOUR)
        {
            var calc = Math.round(amount / this.ONE_MINUTE);
            return calc + ' minute' + (calc > 1 ? 's' : '');
        }
        else if (amount > this.ONE_HOUR && amount < this.ONE_DAY)
        {
            var calc = Math.round(amount / this.ONE_HOUR);
            return calc + ' hour' + (calc > 1 ? 's' : '');
        }
        else if (amount == this.ONE_DAY)
        {
            return '1 day';
        }
        else if (amount > this.ONE_DAY && amount < this.ONE_YEAR)
        {
            if (amount > this.ONE_MONTH)
            {
                var calc = Math.round(amount / this.ONE_MONTH);
                return calc + ' month' + (calc > 1 ? 's' : '');
            }
            else if (amount > this.ONE_WEEK)
            {
                var calc = Math.round(amount / this.ONE_WEEK);
                return calc + ' week' + (calc > 1 ? 's' : '');
            }
            else
            {
                var calc = Math.round(amount / this.ONE_DAY);
                return calc + ' day' + (calc > 1 ? 's' : '');
            }
        }
        else if (amount == this.ONE_YEAR)
        {
            return '1 year';
        }
        else
        {
            var calc = Math.round(amount / this.ONE_DAY);
            return calc + ' years';
        }
    },

    friendlyDiff: function (date, end, shortstr)
    {
        if (!date) return null;
        end = end || new Date();
        var amount = end.getTime() - date.getTime();
        if (amount <= this.ONE_MINUTE)
        {
            if (shortstr)
            {
                return 'a few secs ago';
            }
            return 'a few seconds ago';
        }
        else if (amount < this.ONE_HOUR)
        {
            var calc = Math.round(amount / this.ONE_MINUTE);
            if (calc < 10)
            {
                if (shortstr)
                {
                    return 'a few mins ago';
                }
                return 'a few minutes ago';
            }
            if (shortstr)
            {
                return calc + ' min' + (calc > 1 ? 's' : '') + ' ago';
            }
            return calc + ' minute' + (calc > 1 ? 's' : '') + ' ago';
        }
        else if (amount == this.ONE_HOUR)
        {
            return 'an hour ago';
        }
        else if (amount < this.ONE_DAY)
        {
            var calc = Math.round(amount / this.ONE_HOUR);
            return calc + ' hour' + (calc > 1 ? 's' : '') + ' ago';
        }
        else if (amount == this.ONE_DAY)
        {
            return 'yesterday';
        }
        else if (amount > this.ONE_DAY && amount < this.ONE_YEAR)
        {
            if (amount > this.ONE_MONTH)
            {
                var calc = Math.round(amount / this.ONE_MONTH);
                return calc + ' month' + (calc > 1 ? 's' : '') + ' ago';
            }
            else if (amount > this.ONE_WEEK)
            {
                var calc = Math.round(amount / this.ONE_WEEK);
                return calc + ' week' + (calc > 1 ? 's' : '') + ' ago';
            }
            else
            {
                var calc = Math.round(amount / this.ONE_DAY);
                if (calc == 1)
                {
                    return 'yesterday';
                }
                return calc + ' day' + (calc > 1 ? 's' : '') + ' ago';
            }
        }
        else if (amount > this.ONE_YEAR)
        {
            if (shortstr)
            {
                return '>1 year ago';
            }
            return 'more than a year ago';
        }
        return amount;
    },

    getMonthIntValue: function(s)
    {
        switch (s)
                {
            case "Jan":
                return 0;
            case "Feb":
                return 1;
            case "Mar":
                return 2;
            case "Apr":
                return 3;
            case "May":
                return 4;
            case "Jun":
                return 5;
            case "Jul":
                return 6;
            case "Aug":
                return 7;
            case "Sep":
                return 8;
            case "Oct":
                return 9;
            case "Nov":
                return 10;
            case "Dec":
                return 11;
        }
    },
    intval: function(s)
    {
        if (s)
        {
            if (s.charAt(0) == '0')
            {
                s = s.substring(1);
            }
            return parseInt(s);
        }
        return 0;
    },
/**
 * return a friendly date - can pass a string or date object. if string, must be in the
 * RFC2822 format
 */
    getFriendlyDate: function (date, qualifiers)
    {
        //allow specifiers to be appended before returning based on format
        var q = Object.extend(
        {
            today: '',
            yesterday: '',
            past: '',
            lowercase: false
        }, qualifiers || "");

        date = date || new Date();
        var localDate = typeof(date) == "string" ? Appcelerator.Util.DateTime.parseRFC2822Date(date) : date;
        if (Appcelerator.Util.DateTime.isToday(localDate))
        {
            return q['today'] + Appcelerator.Util.DateTime.get12HourTime(localDate);
        }
        else if (Appcelerator.Util.DateTime.isYesterday(localDate))
        {
            return q['yesterday'] + (q['lowercase'] ? "yesterday" : "Yesterday");
        }
        return q['past'] + localDate.getDay() + " " + Appcelerator.Util.DateTime.getShortMonthName(localDate);
    },
/**
 * given a date object, return true if the
 * date is today (not necessary in the same
 * hour, but in the same day period)
 */
    isToday: function (date)
    {
        var now = new Date();
        return (now.getFullYear() == date.getFullYear() &&
                now.getMonth() == date.getMonth() &&
                now.getDay() == date.getDay());
    },
/**
 * given a date object, return true if the
 * date is yesterday (not necessary in the same
 * hour, but in the same day period)
 */
    isYesterday: function (date)
    {
        var now = new Date();
        return (now.getFullYear() == date.getFullYear() &&
                now.getMonth() == date.getMonth() &&
                now.getDay() - 1 == date.getDay());
    },
    getShortMonthName: function (date)
    {
        var month = date.getMonth();
        switch (month)
                {
            case 0:
                return "Jan";
            case 1:
                return "Feb";
            case 2:
                return "Mar";
            case 3:
                return "Apr";
            case 4:
                return "May";
            case 5:
                return "Jun";
            case 6:
                return "Jul";
            case 7:
                return "Aug";
            case 8:
                return "Sep";
            case 9:
                return "Oct";
            case 10:
                return "Nov";
            case 11:
                return "Dec";
        }
    },
    get12HourTime: function (d, seconds, milli)
    {
        var date = d;
        if (date == null)
        {
            date = new Date();
        }
        var hour = date.getHours();
        var str = (hour == 0) ? 12 : hour;
        var ampm = "AM";
        if (hour >= 12)
        {
            // convert to 12-hour clock
            str = (hour == 12) ? 12 : (hour - 12);
            ampm = "PM";
        }
        var m = date.getMinutes();
        var s = date.getSeconds();
        str += ":" + (m < 10 ? "0" : "") + m;
        if (seconds)
        {
            str += ":" + (s < 10 ? "0" : "") + s;
        }
        if (milli)
        {
            var ms = date.getMilliseconds();
            str += "." + (ms < 10 ? "0" : "") + ms;
        }
        str += " " + ampm;
        return str;
    },
    getShortDateTime: function (d)
    {
        if (d && typeof(d) == 'string')
        {
            d = this.parseJavaDate(d);
        }
        var date = d || new Date();
        return this.getShortMonthName(date) + " " + date.getDate() + " " + this.get12HourTime(date);
    },
    parseInt: function (x)
    {
        if (x)
        {
            // parseInt with a leading 0 returns 0 instead of the value
            // so we chop it off
            if (x.charAt(0) == '0')
            {
                return this.parseInt(x.substring(1));
            }
            return parseInt(x);
        }
        return 0;
    },
/**
 * given a date in the format: 2006-09-21 22:47:20.0 return a javascript
 * date object. the string format is the same as return when you return
 * a Java Date object with toString()
 *
 */
    parseJavaDate: function (d)
    {
        if (!d || d == '') return null;

        //012345678901234567890
        //2006-09-21 22:47:20.0
        var year = parseInt(d.substring(0, 4));
        // note - javascript month is 0-11 not 1-12
        var month = this.parseInt(d.substring(5, 7)) - 1;
        var day = this.parseInt(d.substring(8, 10));
        var hour = this.parseInt(d.substring(11, 13));
        var minute = this.parseInt(d.substring(14, 16));
        var second = this.parseInt(d.substring(17, 19));
        var milli = this.parseInt(d.substring(20));
        var date = new Date();
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
        date.setHours(hour);
        date.setMinutes(minute);
        date.setSeconds(second);
        date.setMilliseconds(milli);
        return date;
    },
/**
 * given an RFC 2822 formatted date string, return
 * a converted Date object.
 */
    parseRFC2822Date: function (d)
    {
        // EXAMPLE: Wed, 07 Jun 2006 09:03:53 -0700

        var tokens = d.split(" ");

        var day = this.intval(tokens[1]);
        var month = tokens[2];
        var year = tokens[3];

        var timetokens = tokens[4].split(":");
        var hour = this.intval(timetokens[0]);
        var min = this.intval(timetokens[1]);
        var sec = this.intval(timetokens[2]);

        // example: -0700
        // The first two digits indicate the number of hours
        // difference from Universal Time, and the last two digits indicate the
        // number of minutes difference from Universal Time.
        var hourOffset = this.intval(tokens[5].substring(0, 3));

        // convert to GMT (if we're behind GMT, we need to add
        // and if we're ahead of GMT, we need to subtract)
        var gmtHour = 0;
        if (hourOffset < 0)
        {
            gmtHour = hour - (hourOffset);
        }
        else
        {
            gmtHour = hour + (hourOffset);
        }
        if (gmtHour > 23)
        {
            // we've lapsed into the next day
            gmtHour = gmtHour - 24;
            day += 1;
        }
        else if (gmtHour < 0)
        {
            // we've lapsed into the previous day
            gmtHour = 24 - gmtHour;
            day -= 1;
        }
        var gmtDate = new Date();
        gmtDate.setUTCDate(day);
        gmtDate.setUTCMonth(this.getMonthIntValue(month));
        gmtDate.setUTCFullYear(year);
        gmtDate.setUTCHours(gmtHour, min, sec);

        return gmtDate;
    },
    //Returns the client machine's timezone offset from GMT
    //Format is something like -0400 or +0815
    getTimezoneOffset = function()
	{
		var curdate = new Date();
		var offset = curdate.getTimezoneOffset();
		var hours = Math.floor(offset/60);
		var modMin = Math.abs(offset%60);
		var s = new String();
		s += (hours > 0) ? "-" : "+";
		var absHours = Math.abs(hours);
		s += (absHours < 10) ? "0" + absHours :absHours;
		s += ((modMin == 0) ? "00" : modMin);
		return s;
	}
};