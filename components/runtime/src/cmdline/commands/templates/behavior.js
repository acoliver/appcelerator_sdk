Appcelerator.UI.registerUIComponent('behavior','NAME',
{
	/**
	 * The attributes supported by the behaviors. This metadata is 
	 * important so that your behavior can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		
		/*
		Example: 
		return [{name: 'mode', optional: false, description: "Vertical or horizontal alignment",
		         type: T.enumeration('vertical', 'horizontal')}]
		*/
		
		//TODO
		return [];
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
	build: function(element,options)
	{
		//NOTE: if you want to wait until we're compiled before we attached our behavior
		// given that we can have a reference id inside the container we 
		// want to use and we need to make sure we can get the ID before we do anything
		//
		// if you don't care about this, you can just do it directly in the build function
		// and remove the commented block below - otherwise - put it within the observe method
		// function 
		//
		/*
		element.observe('element:compiled:'+element.id,function(a)
		{
		});
		*/
	}
});
