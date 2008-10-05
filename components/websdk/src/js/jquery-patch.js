
// Appcelerator patch for jQuery that supports backwards compatible-mode which attempts to emulate
// Prototype's $() that allows you to just pass ID instead of #id (which is correct css)
if ( window.AppceleratorjQueryPatch && typeof(selector)=='string' && selector.charAt(0)!='#' && /\w+/.test(selector) )  
{
	var elem = document.getElementById(selector);
	if (elem)
	{
		// if found we return the unwrapped DOMElement object instead of the 
		// wrapped jQuery object given that's what Prototype (sortof) returns
		return elem;
	}
}
