
Appcelerator.Module.GoogleAnalytics =
{
	init:null,
	
	getName: function()
	{
		return 'google analytics';
	},
	getDescription: function()
	{
		return 'google analytics helper widget';
	},
	getVersion: function()
	{
		return 1.0;
	},
	getSpecVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Jeff Haynie';
	},
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'google:analytics';
	},
	install:function()
	{
		if (Appcelerator.Browser.isIE)
		{
			switch(this.readyState)
			{
				case 'loaded':   // state when loaded first time
				case 'complete': // state when loaded from cache
					break;
				default:
					return;
			}
		}
		if (window.googleTracker)
		{
			for (var p in window.googleStuff)
			{
				if (p.charAt(0)=='_')
				{
					window[p] = window.googleStuff[p];
				}
			}
			delete window.googleStuff;
			
			if (window.googleTrackLinks)
			{
				var hrefs = document.getElementsByTagName('a');
				for (var c=0;c<hrefs.length;c++)
				{
					var link = hrefs[c];
					if (link.href)
					{
						var hostname = link.hostname;
						var track = false;
						for (var x=0;x<window.googleTrackLinks.length;x++)
						{
							if (hostname.indexOf(window.googleTrackLinks[x])!=-1)
							{
								track = true;
								break;	
							}
						}
						if (track)
						{
							var f = '__utmLinker("'+link.href+'");false;';
							link.setAttribute('onclick',f);
						}
					}
				}
			}
			window.googleTracker();
		}
	},
	getAttributes: function()
	{
		return [{name: 'account', optional: true},
				{name: 'domain', optional: true},
				{name: 'trackoutboundlinks', optional: true}];
	},	
	buildWidget: function(element,parameters)
	{
		var account = parameters['account'];
		var domain = parameters['domain'];
		var trackoutboundlinks = parameters['trackoutboundlinks'];
		var outboundLinks = [];
		
		if (trackoutboundlinks)
		{
			trackoutboundlinks.split(',').each(function(f)
			{
				outboundLinks.push(f.trim());
			});
		}
		
		window.googleStuff = {};
		window.googleStuff._uacct = account;
		window.googleStuff._uanchor = 1;
		window.googleStuff._ulink = 1;
		
		if (domain)
		{
			window.googleStuff._udn = domain;
			window.googleStuff._uhash = 'off';
		}
		
		// we walk these domains for links and make sure that
		// we propogate google tracking cookies to them using __utmLinker
		if (outboundLinks.length > 0)
		{
			window.googleTrackLinks = [];
			
			for (var c=0;c<outboundLinks.length;c++)
			{
				window.googleTrackLinks.push(outboundLinks[c]);
			}
		}
		
		window.googleTracker = function()
		{
			urchinTracker();
		};
		
		var script = document.createElement('script');
		script.setAttribute('type','text/javascript');
		script.setAttribute('src','http://www.google-analytics.com/urchin.js');
		script.setAttribute('onload','Appcelerator.Module.GoogleAnalytics.install();'); // TODO: does this work on Safari?
		script.setAttribute('onreadystatechange','Appcelerator.Module.GoogleAnalytics.install();');
		document.getElementsByTagName('head')[0].appendChild(script);
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REMOVE
		};
	}
};


Appcelerator.Core.registerModule('google:analytics',Appcelerator.Module.GoogleAnalytics);