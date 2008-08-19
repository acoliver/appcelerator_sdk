Appcelerator.UI.registerUIComponent('behavior','shadow',
{
	/**
	 * The attributes supported by the behaviors. This metadata is 
	 * important so that your behavior can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'theme', optional: true, description: "theme for the shadow",defaultValue: Appcelerator.UI.UIManager.getDefaultTheme('shadow')}];
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
		var newContainer = document.createElement('div');	
		newContainer.id = element.id + "_shadow";	
		newContainer.className = 'shadow_' + options['theme'];
		var d1 = document.createElement("div");
		d1.className = "shadow_" + options['theme'] + "_1";
		var d2 = document.createElement("div");
		d2.className = "shadow_" + options['theme'] + "_2";
		var d3 = document.createElement("div");
		d3.className = "shadow_" + options['theme'] + "_3";;
		newContainer.appendChild(d1);
		d1.appendChild(d2);
	 	d2.appendChild(d3);
		var clearDiv = document.createElement("div");
		clearDiv.style.clear = "both";
		element.wrap(newContainer);	
		d3.appendChild(element);
		newContainer.appendChild(clearDiv);
		

		// add modal dependency
		Appcelerator.UI.addElementUIDependency(element,'behavior','shadow','behavior', 'modal', function(element)
		{
			if (element.style.width == '')
			{
				throw "Shadow behavior requires an explicit width via the 'style' attribute when used with the modal behavior";
				return;
			}
			newContainer.style.width = element.style.width;	
		});		

		
		// add tooltip dependency
		Appcelerator.UI.addElementUIDependency(element,'behavior','shadow','behavior', 'tooltip', function(element)
		{
			Element.hide(newContainer);
		});		


		Appcelerator.Core.loadTheme('behavior','shadow',options['theme'],element,options);	

	}
});
