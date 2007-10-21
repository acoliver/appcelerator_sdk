/**
 * this is a simple utility for dynamically loading iframes and returning the 
 * content from the iframe's <body> in the callback
 */
Appcelerator.Util.IFrame = 
{
	fetch: function(src,onload,removeOnLoad)
	{
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
  		var scope = {iframe:iframe,frameid:frameid,onload:onload,removeOnLoad:(removeOnLoad==null)?true:removeOnLoad,src:src};
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
		}
		
		this.onload(body);
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
	}
};