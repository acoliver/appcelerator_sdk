Appcelerator.UI.registerUIComponent('type','button',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [
				{name: 'width', optional: true, description: " width for panel" ,defaultValue: 'auto', type: T.cssDimension}];
	},

	disable: function(id,parameters,data,scope,version,attrs,direction,action)
	{		
		var theme = $(id).theme;
		Element.addClassName(id + "_left", "button_" + theme + "_left_disabled");
		Element.addClassName(id,"button_" + theme + "_middle_disabled");
		Element.addClassName(id + "_right","button_" + theme + "_right_disabled");
		$(id).setAttribute("disabled","true");
	},
	enable: function(id,parameters,data,scope,version,attrs,direction,action)
	{
		var theme = $(id).theme;
		Element.removeClassName(id + "_left"  ,"button_" + theme + "_left_disabled");
		Element.removeClassName(id,"button_" + theme + "_middle_disabled");
		Element.remveClassName(id + "_right" ,"button_" + theme + "_right_disabled");		
		$(id).removeAttribute("disabled");
	},
	getActions: function()
	{
		return ['disable','enable'];
	},
	
	build: function(element,options)
	{
		var theme = options['theme'];
		Element.addClassName(element,"button_" + theme + "_middle");
		element.theme = theme;
		
		// wrap input with two images (left and right)
		var img1 = document.createElement('img');
		var blankImg = Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/blank.gif';
		img1.src= blankImg;
		img1.id = element.id + "_left";
		img1.className = "button_" + theme + "_left";		
		new Insertion.Before(element,img1);	
		var img2 = document.createElement('img');
		img2.src = blankImg;
		img2.id = element.id + "_right";
		img2.className = "button_" + theme + "_right";
		new Insertion.After(element,img2);
		
		// FF positioning is off - fix it
		if (Appcelerator.Browser.isGecko)
		{
			Element.addClassName(img1,"button_" + theme + "_geckofix");
			Element.addClassName(img2,"button_" + theme + "_geckofix");
			
		}
		// fix PNGs
		if (Appcelerator.Browser.isIE6)
		{
			img1.addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			img2.addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			element.addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			
		}
		var self = this;
		
		// check initial state of button
		if (element.disabled)
		{
			self.disable(element.id);	
		}
		
		Appcelerator.Core.loadTheme('type','button',theme);
		
		if (element.getAttribute('activators'))
		{
			element.onActivatorsDisable = function()
			{
				self.disable(element.id);
			};
			element.onActivatorsEnable = function()
			{
				self.enable(element.id);
			};
		}
	}
});
