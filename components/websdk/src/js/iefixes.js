
//Correctly handle PNG transparency in Win IE 5.5 & 6.
//http://homepage.ntlworld.com/bobosola. Updated 18-Jan-2006.
//modified to work with delayed loading for Appcelerator by JHaynie
if (Appcelerator.Browser.isIE6)
{
	document.getElementsByTagNameNS = function(xmlns, tag)
	{
		var ar = $A(document.getElementsByTagName('*'));
		// IE doesn't under default - of course
		if(xmlns == "http://www.w3.org/1999/xhtml") 
		{
			xmlns = "";
		}
		var found = [];
		for (var c=0,len=ar.length;c<len;c++)
		{
			var elem = ar[c];
			if (elem.tagUrn == xmlns && (tag == '*' || elem.nodeName == tag))
			{
				found.push(elem);
			}
		}
		return found;
	};

	try
	{
		// remove CSS background image flicker and cache images if
		// the server says so
		// http://evil.che.lu/2006/9/25/no-more-ie6-background-flicker
   		document.execCommand("BackgroundImageCache", false, true);
    }
	catch(e){}
}