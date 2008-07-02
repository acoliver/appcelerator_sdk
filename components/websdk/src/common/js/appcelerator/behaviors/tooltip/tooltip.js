Appcelerator.UI.registerUIComponent('behavior','tooltip',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'id', optional: false, description: "element id that triggers tooltip"}
		];
	},
	build: function(element,options)
	{
		element.style.display = "none";
		var parent = null;
		if (element.getAttribute("set").indexOf('shadow') != -1) 
		{
			parent = element.parentNode.parentNode.parentNode;
			Element.hide(parent);
		}

		var timer;
		
		function startTimer(el)
		{
			cancelTimer();
			timer = setTimeout(function(){Element.hide(el)},500);
		}
		function cancelTimer()
		{
			if (timer)
			{
				clearTimeout(timer);
				timer = null;
			}				
		}
		Event.observe($(options['id']),'mouseover',function(e)
		{
			cancelTimer();

			Element.show(element);
			if (parent != null)
			{
				parent.style.position = "absolute";
				parent.style.zIndex = 1;
				parent.style.top = Event.pointerY(e) + 10 + "px";
				parent.style.left = Event.pointerX(e) + 10 + "px";	
				Element.show(parent)			
			}
			else
			{
				element.style.position = "absolute";
				element.style.zIndex = 1;
				element.style.top = Event.pointerY(e) + 10 + "px";
				element.style.left = Event.pointerX(e) + 10 + "px";
				
			}
			
		});
		Event.observe($(options['id']),'mouseout',function(e)
		{
			startTimer(element);
		});	
		Event.observe(element,'mouseover',function(e)
		{
			cancelTimer();
		});		
		Event.observe(element,'mouseout',function(e)
		{
			startTimer(element);
		});		

	}
});
