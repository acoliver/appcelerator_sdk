Mock = Class.create();	

Mock.prototype = 
{
	initialize: function() 
	{
	},
	
	generateHeader: function()
	{
		var html = [];
		html.push('<h1>App Blog: The Appcelerated blog platform</h1>');
		return html.join(' ');		
	},
	
	generateFooter: function()
	{
		var html = [];
		html.push("Copyright 2007 <a href='http://www.appcelerator.com'>Appcelerator, Inc</a><br />");
		html.push("Powered by <a href='http://www.appcelerator.org'>Appcelerator</a>");
		return html.join(' ');
	},
	
	archiveSection: function()
	{
		var html = [];
		html.push("<h3>Archives</h3>");
		html.push("<ul>");
		html.push("<li><a on='click then l:reload.from.archive and r:load.content.request[type=\"archive\"]'>Last Month</a></li>");
		html.push("<li><a on='click then l:reload.from.archive and r:load.content.request'>All</a></li>");
		html.push("</ul>")
		return html.join(' ');		
	},
	
	linksSection: function()
	{
		var html = [];
		html.push('<h3>"Competitors"</h3>');
		html.push('<ul>');
		html.push("<li><a href='http://code.google.com/webtoolkit'>GWT</a></li>");
		html.push("<li><a href='http://www.adobe.com/products/flex'>Flex</a></li>");
		html.push("<li><a href='http://www.openlaszlo.org'>Openlaszlo</a></li>");
		html.push("<li><a href='http://upload.wikimedia.org/wikipedia/en/a/a8/Windows_XP_BSOD.png'>Silverlite</a></li>");
		html.push("</ul>");
		return html.join(' ');
	},
	
	generateSidebar: function()
	{
		var html = [];
		html.push(this.archiveSection());
		html.push(this.linksSection());
		return html.join("<hr /> ");
	},
	
	generateContent: function()
	{
		var html = [];
		html.push(this.postOne());
		html.push(this.postTwo());
		html.push(this.postThree());
		return html.join(" ");
	},

	generateContentLastMonth: function()
	{
		var html = [];
		html.push(this.postTwo());
		html.push(this.postThree());
		return html.join(" ");
	},
	
	postOne: function()
	{
		var html = [];
		html.push('<h2>Welcome to app blog</h2>');
		html.push("<p class='date'>10/1/2007</p>");
		html.push("<div class='post'>");
		html.push("<p>");
		html.push("Welcome to appblog, the appcelerated blogging platform.  This demo has been written");
		html.push("to illustrate how to write something useful with the Appcelerator framework.")
		html.push("</p>")
		html.push("</div>");
		return html.join(' ');
	},
	
	postTwo: function()
	{
		var html = [];
		html.push('<h2>Appcelerator is OpenSource</h2>');
		html.push("<p class='date'>9/30/2007</p>");
		html.push("<div class='post'>");
		html.push("<p>");
		html.push("Appcelerator is licensed under the GPLv2, the same license that the Linux Kernel, GCC,");
		html.push("Jasper Reports, and MySQL are distributed under")
		html.push("</p>")
		html.push("</div>");
		return html.join(' ');
	},
	
	postThree: function()
	{
		var html = [];
		html.push('<h2>More Code. Less App.</h2>');
		html.push("<p class='date'>9/29/2007</p>");
		html.push("<div class='post'>");
		html.push("<p>");
		html.push("If you use a traditional MVC framework, that's what you get.");
		html.push("That's really good news, if your christmas bonus is based on Lines of Code.");
		html.push("But if you're like us, and just want to get things done and get them done fast,");
		html.push("then this is the right place.");
		html.push("</p>")
		html.push("</div>");
		return html.join(' ');
	}
};

window.printMe = function(element) 
{
    var str;
	var keys = Object.keys(element);
    for(var p in keys) 
    {
        str += "{ " + p + ", " + element[p] + "}, ";
    }
    Logger.debug(str);
}
