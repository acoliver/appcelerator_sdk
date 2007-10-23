/**
 * simple check to see if you're trying to go directly to a content
 * page and if so, redirect to our main doc page and go directly to the 
 * content page via history change
 */
if (typeof(parent.Appcelerator)=='undefined')
{
	var href = window.location.href;
	var idx = href.lastIndexOf('/');
	var anchor = href.substring(idx+1).replace('.html','');
    window.location.href = 'index.html#'+anchor;
}
