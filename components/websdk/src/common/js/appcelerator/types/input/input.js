Appcelerator.UI.registerUIComponent('type','input',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [];
	},
	
	build: function(element,options)
	{
		var theme = options['theme'] || Appcelerator.UI.UIManager.getDefaultTheme('input')
		Element.addClassName(element,"input_" + theme + "_input");
		
		// wrap input with two images (left and right)
		var img1 = document.createElement('img');
		var blankImg = Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/blank.gif';
		img1.src= blankImg;
		img1.className = "input_" + theme + "_left";		
		new Insertion.Before(element,img1);	
		var img2 = document.createElement('img');
		img2.src = blankImg;
		img2.className = "input_" + theme + "_right";
		new Insertion.After(element,img2);

		// FF positioning is off - fix it
		if (Appcelerator.Browser.isGecko)
		{
			Element.addClassName(img1,"input_" + theme + "_geckofix");
			Element.addClassName(img2,"input_" + theme + "_geckofix");
		}

		// fix PNGs
		if (Appcelerator.Browser.isIE6)
		{
			img1.addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			img2.addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
		}
		
		Appcelerator.Core.loadTheme('type','input',theme);	
		
	}
});
