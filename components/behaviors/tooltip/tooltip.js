Appcelerator.UI.registerUIComponent('behavior','tooltip',
{
	/**
	 * The attributes supported by the behaviors. This metadata is 
	 * important so that your behavior can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'id', optional: false, description: "element id that triggers tooltip"}
		];
	},
	/**
	 * The version of the behavior. This will automatically be corrected when you
	 * publish the component.
	 */
	getVersion: function()
	{
		// leave this as-is and only configure from the build.yml file 
		// and this will automatically get replaced on build of your distro
		return '__VERSION__';
	},
	/**
	 * The behavior spec version.  This is used to maintain backwards compatability as the
	 * Widget API needs to change.
	 */
	getSpecVersion: function()
	{
		return 1.0;
	},
	/**
	 * This is called when the behavior is loaded and applied for a specific element that 
	 * references (or uses implicitly) the behavior.
	 */
	build:  function(element,options)
	{
		element.style.display = "none";
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
			var parent = null;
			if (element.getAttribute("set").indexOf('shadow') != -1) 
			{
				// this is the shadow's parent element
				parent = $(element.id + "_shadow_container");
			}
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
