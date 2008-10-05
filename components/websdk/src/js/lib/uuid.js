/**
 * utility function to generate a semi-random uuid
 * which is good enough as a unique id for what we normally want
 */
App.UUID =
{
    dateSeed: (started || new Date).getTime(),
	convert: ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],

	// Numeric Base Conversion algorithm from irt.org
	// In base 16: 0=0, 5=5, 10=A, 15=F
 	base16: function(number)
	{
		//
		// Copyright 1996-2006 irt.org, All Rights Reserved.	
		//
		// Downloaded from: http://www.irt.org/script/146.htm	
		// slight modifications by Jeff Haynie/Appcelerator
		// you should be able to use String.toString(16) but 
		// apparently not reliable on all browsers (hint IE)
		//
		var output = null;
	    if (number < 16)
		{
			output = this.convert[number];
		}
	    else 
		{
	        var MSD = '' + Math.floor(number / 16);
	        var LSD = number - MSD*16;
	        if (MSD >= 16)
			{
				output = this.base16(MSD) + this.convert[LSD];
			}
	        else
			{
				output = this.convert[MSD] + this.convert[LSD];
			}
	    }
	    return output;
	},
    newID: function()
    {
		var dg = new Date(1970, 9, 22, 0, 0, 0, 0);
		var t = this.base16(this.dateSeed - dg.getTime());
        var a = this.base16(Math.floor(999999999999 * Math.random()));
        var _b = App.MD5.hex_md5(window.location.pathname);
		var b = (_b.length > 10 ? _b.substring(0,10) : _b).gsub(/[^a-zA-Z0-9]/,'0');
        var c = this.base16(Math.round(this.dateSeed * Math.random()));
        return t + '-' + a + '-' + b + '-' + c;
    }
};