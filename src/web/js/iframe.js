/**
 * this is a simple utility for dynamically loading iframes and returning the 
 * content from the iframe's <body> in the callback
 */
Appcelerator.Util.IFrame = 
{
	fetch: function(src,onload,removeOnLoad,copyContent)
	{
		copyContent = (copyContent==null) ? false : copyContent;
		var frameid = 'frame_'+new Date().getTime()+'_'+Math.round(Math.random() * 99);
		var frame = document.createElement('iframe');
	   	frame.setAttribute('id', frameid);
	   	//This prevents Firefox 1.5 from getting stuck while trying to get the contents of the new iframe
	   	if(!Appcelerator.Browser.isFirefox)
	   	{
	   		frame.setAttribute('name', frameid);
	   	}
	   	frame.setAttribute('src',Appcelerator.DocumentPath+src);
	   	frame.style.position = 'absolute';
	   	frame.style.width = frame.style.height = frame.borderWidth = '1px';
		// in Opera and Safari you'll need to actually show it or the frame won't load
		// so we just put it off screen
		frame.style.left = "-50px";
		frame.style.top = "-50px";
	   	var iframe = document.body.appendChild(frame);
		// this is a IE speciality
  		if (window.frames && window.frames[frameid]) iframe = window.frames[frameid];
  		iframe.name = frameid;
  		var scope = {iframe:iframe,frameid:frameid,onload:onload,removeOnLoad:(removeOnLoad==null)?true:removeOnLoad,src:src,copyContent:copyContent};
  		if (!Appcelerator.Browser.isFirefox)
  		{
  			setTimeout(Appcelerator.Util.IFrame.checkIFrame.bind(scope),10);
  		}
  		else
  		{
	  		iframe.onload = Appcelerator.Util.IFrame.doIFrameLoad.bind(scope);
  		}
	},
	monitor: function(frame,onload)
	{
        var scope = {iframe:frame,frameid:frame.id,onload:onload,removeOnLoad:false};
        if (!Appcelerator.Browser.isFirefox)
        {
            setTimeout(Appcelerator.Util.IFrame.checkIFrame.bind(scope),10);
        }
        else
        {
            frame.onload = Appcelerator.Util.IFrame.doIFrameLoad.bind(scope);
        }
	},
	doIFrameLoad: function()
	{
		var doc = this.iframe.contentDocument || this.iframe.document;
		var body = doc.documentElement.getElementsByTagName('body')[0];
		
		if (Appcelerator.Browser.isSafari && Appcelerator.Browser.isWindows && body.childNodes.length == 0)
		{
			Appcelerator.Util.IFrame.fetch(this.src, this.onload, this.removeOnLoad);
			return;
		}
		
		if (this.copyContent)
		{
	        var div = document.createElement('div');
	        var head = doc.documentElement.getElementsByTagName('head')[0];
	        
	        Appcelerator.Util.IFrame.loadStyles(doc.documentElement);
	        
	        var bodydiv = document.createElement('div');
	        bodydiv.innerHTML = body.innerHTML;
	        div.appendChild(bodydiv);
	        
	        this.onload(div);
		}
		else
		{
            this.onload(body);
		}
		if (this.removeOnLoad)
		{
			var f = this.frameid;
			if (Appcelerator.Browser.isFirefox)
			{
				// firefox won't stop spinning with Loading... message
				// if you remove right away
				setTimeout(function(){Element.remove(f)},50);
			}
			else
			{
				Element.remove(f);
			}
		}
	},
	checkIFrame:function()
	{
		var doc = this.iframe.contentDocument || this.iframe.document;
		var il = this.iframe.location, dr = doc.readyState;
		if (dr == 'complete' || (!document.getElementById && dr == 'interactive'))
	 	{
	 		Appcelerator.Util.IFrame.doIFrameLoad.call(this);
	 	}
	 	else
	 	{
	  		setTimeout(Appcelerator.Util.IFrame.checkIFrame.bind(this),10);
	 	}
	},
	loadStyles:function(element)
	{
		for (var i = 0; i < element.childNodes.length; i++)
		{
			var node = element.childNodes[i];

			if (node.nodeName == 'STYLE')
			{
				if (Appcelerator.Browser.isIE)
				{
					var style = document.createStyleSheet();
					style.cssText = node.styleSheet.cssText;
				}
				else
				{
					var style = document.createElement('style');
					style.setAttribute('type', 'text/css');
					try
					{
						style.appendChild(document.createTextNode(node.innerHTML));
					}
					catch (e)
					{
						style.cssText = node.innerHTML;
					}				
					Appcelerator.Core.HeadElement.appendChild(style);
				}
			}
			else if (node.nodeName == 'LINK')
			{
				var link = document.createElement('link');
				link.setAttribute('type', node.type);
				link.setAttribute('rel', node.rel);
				link.setAttribute('href', node.getAttribute('href'));
				Appcelerator.Core.HeadElement.appendChild(link);
			}
			
			Appcelerator.Util.IFrame.loadStyles(node);
		}
	}
};