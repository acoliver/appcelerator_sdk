Appcelerator.UI.registerUIComponent('behavior','modal',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'modal-background-color', optional: true, description: "background color for modal",defaultValue: '#222'},
	       	    {name: 'opacity', optional: true, description: "opacity for modal background",defaultValue: 0.6},
	       	    {name: 'showMessage', optional: true, description: "message that activates modal state", defaultValue:null},
	       	    {name: 'hideMessage', optional: true, description: "message that activates modal state", defaultValue:null}
	
				];
	},
	build: function(element,options)
	{
		var on = element.getAttribute("on");
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
		
		// modal content
		var overlayDataHTML = document.createElement("div");
		overlayDataHTML.id = element.id + "_modal_dialog";
		overlayDataHTML.style.position = "absolute";
		overlayDataHTML.style.zIndex = "2001";
		overlayDataHTML.style.top = "100px";
		overlayDataHTML.style.width = "95%"
		overlayDataHTML.style.display = "none";
		overlayDataHTML.setAttribute('align','center');

		new Insertion.Bottom(document.body,overlayDataHTML);
		new Insertion.Bottom(document.body,modalContainer);

		// process hide/show
		if (on)
		{
			modalContainer.setAttribute('on',on);
			overlayDataHTML.setAttribute('on',on);
			Appcelerator.Compiler.dynamicCompile(modalContainer);
			Appcelerator.Compiler.dynamicCompile(overlayDataHTML);
		}
		
		if (options['showMessage'] != null)
		{
			$MQL(options['showMessage'],function(t, data, datatype, direction)
			{
				Element.show(modalContainer);
				Element.show(overlayDataHTML);
				Element.show(element)
			});
		}

		if (options['hideMessage'] != null)
		{
			$MQL(options['hideMessage'],function(t, data, datatype, direction)
			{
				Element.hide(modalContainer);
				Element.hide(overlayDataHTML);
				Element.hide(element);
			});
		}
		// if element already has a shadow then use it
		if ($(element.id + "_shadow"))
		{
			overlayDataHTML.appendChild($(element.id+"_shadow"));			
		}
		else
		{
			overlayDataHTML.appendChild(element);			
		}
		
	}
});
