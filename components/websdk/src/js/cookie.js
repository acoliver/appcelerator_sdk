Appcelerator.Util.Cookie = Class.create();
Appcelerator.Util.Cookie = 
{
	toString: function ()
	{
		return "[Appcelerator.Util.Cookie]";
	},
	
    // ---------------------------------------------------------------
    //  Cookie Functions - Second Helping  (21-Jan-96)
    //  Written by:  Bill Dortch, hIdaho Design <BDORTCH@NETW.COM>
    //  The following functions are released to the public domain.
    //
    //  The Second Helping version of the cookie functions dispenses with
    //  my encode and decode functions, in favor of JavaScript's new built-in
    //  escape and unescape functions, which do more complete encoding, and
    //  which are probably much faster.
    //
    //  The new version also extends the SetCookie function, though in
    //  a backward-compatible manner, so if you used the First Helping of
    //  cookie functions as they were written, you will not need to change any
    //  code, unless you want to take advantage of the new capabilities.
    //
    //  The following changes were made to SetCookie:
    //
    //  1.  The expires parameter is now optional - that is, you can omit
    //      it instead of passing it null to expire the cookie at the end
    //      of the current session.
    //
    //  2.  An optional path parameter has been added.
    //
    //  3.  An optional domain parameter has been added.
    //
    //  4.  An optional secure parameter has been added.
    //
    //  For information on the significance of these parameters, and
    //  and on cookies in general, please refer to the official cookie
    //  spec, at:
    //
    //      http://www.netscape.com/newsref/std/cookie_spec.html    
    //
    //
    // "Internal" function to return the decoded value of a cookie
    //
    getCookieVal: function (offset) {
      var endstr = document.cookie.indexOf (";", offset);
      if (endstr == -1)
      {
        endstr = document.cookie.length;
      } 
      return unescape(document.cookie.substring(offset, endstr));
    },

    //
    //  Function to return the value of the cookie specified by "name".
    //    name - String object containing the cookie name.
    //    returns - String object containing the cookie value, or null if
    //      the cookie does not exist.
    //
    GetCookie: function (name) {
      var arg = escape(name) + "=";
      var alen = arg.length;
      var clen = document.cookie.length;
      var i = 0;
      while (i < clen) {
        var j = i + alen; 
        var value = document.cookie.substring(i,j);
        if (value == arg)
		{
            var cookieval = this.getCookieVal (j);
            if (cookieval!=null && cookieval!='')
            {
      			$D(this,"GetCookie",name+"="+cookieval);
      			return cookieval;
      		}
      		else
      		{
			  	$D(this,"GetCookie",name+"=null");
      			return null;
      		}
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break; 
      }
  	  $D(this,"GetCookie",name+"=null");
      return null;
    },

    //
    //  Function to create or update a cookie.
    //    name - String object object containing the cookie name.
    //    value - String object containing the cookie value.  May contain
    //      any valid string characters.
    //    [expires] - Date object containing the expiration data of the cookie.  If
    //      omitted or null, expires the cookie at the end of the current session.
    //    [path] - String object indicating the path for which the cookie is valid.
    //      If omitted or null, uses the path of the calling document.
    //    [domain] - String object indicating the domain for which the cookie is
    //      valid.  If omitted or null, uses the domain of the calling document.
    //    [secure] - Boolean (true/false) value indicating whether cookie transmission
    //      requires a secure channel (HTTPS).  
    //
    //  The first two parameters are required.  The others, if supplied, must
    //  be passed in the order listed above.  To omit an unused optional field,
    //  use null as a place holder.  For example, to call SetCookie using name,
    //  value and path, you would code:
    //
    //      SetCookie ("myCookieName", "myCookieValue", null, "/");
    //
    //  Note that trailing omitted parameters do not require a placeholder.
    //
    //  To set a secure cookie for path "/myPath", that expires after the
    //  current session, you might code:
    //
    //      SetCookie (myCookieVar, cookieValueVar, null, "/myPath", null, true);
    //
    SetCookie: function (name, value) {
      var argv = this.SetCookie.arguments;
      var argc = this.SetCookie.arguments.length;
      var expires = (argc > 2) ? argv[2] : null;
      var path = (argc > 3) ? argv[3] : null;
      var domain = (argc > 4) ? argv[4] : null;
      var secure = (argc > 5) ? argv[5] : false;
      var cookie = escape(name) + "=" + escape (value) +
        ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
        ((path == null) ? "" : ("; path=" + path)) +
        ((domain == null) ? "" : ("; domain=" + domain)) +
        ((secure) ? "; secure" : "");
      $D(this,"SetCookie",cookie);
      document.cookie = cookie;
    },

    //  Function to delete a cookie. (Sets expiration date to current date/time)
    //    name - String object containing the cookie name
    // 
    // modified by Jeff Haynie to allow multiple deletions by passing in multiple
    // cookies names in the function call
    //
    DeleteCookie: function () 
    {
		var date = new Date();
		date.setTime(date.getTime()+(-1*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();

		var args=$A(arguments);
      	var self = this;
      	args.each(function(name)
      	{
	      $D(self,"DeleteCookie",name);
	      // delete both local path and the root path (seems to be the only sure way)
		  document.cookie = name+"="+expires+"; path=/";
		  document.cookie = name+"="+expires+";";
		});
    },
    
    //
    // returns true if a cookie with name exists, or false if not
    //
    HasCookie: function (name) 
    {
    	return this.GetCookie(name) != null;
    }
};    

if (window.location.protocol!='file:')
{
	(function()
	{
		if (Appcelerator.Config['cookie_check'])
		{
			Appcelerator.Util.Cookie.SetCookie('CookieCheck','1');
			var cookie = Appcelerator.Util.Cookie.GetCookie('CookieCheck');
			if (!cookie)
			{
			   // cookies not working
			   window.location = Appcelerator.DocumentPath + 'upgrade_cookies.html';
			}
			else
			{
			   // just delete it
			   Appcelerator.Util.Cookie.DeleteCookie('CookieCheck');
			}
		}
	})();
}	
