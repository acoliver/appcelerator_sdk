Appcelerator.UI.registerUIComponent('behavior','modal',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'modal-background-color', optional: true, description: "background color for modal",defaultValue: '#222'},
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
			var width = (Appcelerator.Browser.isIE6)? windowWidth + "px":"100%";

			// modal container
			var modalContainer = document.createElement('div');
			modalContainer.id = element.id + "_modal_container";
			modalContainer.className = 'behavior modal';	
			modalContainer.style.display = "none";
			modalContainer.style.position = "absolute";
			modalContainer.style.top = "0px";
			modalContainer.style.left = "0px";
			modalContainer.style.zIndex = "2000";
			modalContainer.style.width = width;
			modalContainer.style.height = windowHeight + "px";
			modalContainer.style.backgroundColor = options['modal-background-color'];
			modalContainer.style.opacity = options['opacity'];
			modalContainer.style.filter = "alpha( opacity = "+options['opacity']*100+")";
			modalContainer.setAttribute('on',on);
			
			// modal content
			var overlayDataHTML = document.createElement("div");
			overlayDataHTML.style.position = "absolute";
			overlayDataHTML.style.zIndex = "2001";
			overlayDataHTML.style.top = "100px";
			overlayDataHTML.style.width = "95%"
			overlayDataHTML.style.display = "none";
			overlayDataHTML.setAttribute("on",on);
			overlayDataHTML.setAttribute('align','center');

			new Insertion.Bottom(document.body,overlayDataHTML);
			new Insertion.Bottom(document.body,modalContainer);

			Appcelerator.Compiler.dynamicCompile(modalContainer);
			Appcelerator.Compiler.dynamicCompile(overlayDataHTML);
			
			overlayDataHTML.appendChild(element);			
		}
		else
		{
			throw "on expression required for 'on' behavior";
		}
		
	}
});
