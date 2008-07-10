Appcelerator.UI.registerUIComponent('behavior','modal',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'background-color', optional: true, description: "background color for modal",defaultValue: '#222'},
	       	    {name: 'opacity', optional: true, description: "opacity for modal background",defaultValue: 0.6}		
				];
	},
	
	build: function(element,options)
	{
		var on = element.getAttribute("on");
		if (on)
		{	
			// window size
			var windowHeight = (Appcelerator.Browser.isIE)?document.documentElement.clientHeight:window.outerHeight;
			var windowWidth = (Appcelerator.Browser.isIE)?document.documentElement.clientWidth:window.innerWidth;

			// modal container
			var container = document.createElement("div");
			container.id = element.id + "_modal_container";
			var width = (Appcelerator.Browser.isIE6)? windowWidth + "px":"100%";
			var overlayHtml = '<div style="display:none;position:absolute;top:0;left:0;z-index:2000;width:'+width+';height:'+windowHeight+'px;overflow:hidden;background-color:'+options['background-color']+';filter: alpha( opacity = '+options['opacity']*100+' );-moz-opacity:'+options['opacity']+';opacity:'+options['opacity']+';" on="'+on+'" ></div>';
			new Insertion.Bottom(container, overlayHtml);
			
			// modal content
			var overlayDataHTML = document.createElement("div");
			overlayDataHTML.style.display = "none";
			overlayDataHTML.style.zIndex = "2001";
			overlayDataHTML.style.position = "relative";
			overlayDataHTML.style.top = 100 - element.offsetTop + "px";
			overlayDataHTML.setAttribute("align","center");
			overlayDataHTML.setAttribute("on",on);
			
			new Insertion.Bottom(container, overlayDataHTML);
			Appcelerator.Compiler.dynamicCompile(container);
			new Insertion.Bottom(overlayDataHTML,element);
			new Insertion.Bottom(document.body,container);
		}
		else
		{
			throw "on expression required for 'on' behavior";
		}
		
	}
});
