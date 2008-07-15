Appcelerator.UI.registerUIComponent('control','NAME',
{
	/**
	 * The attributes supported by the controls. This metadata is 
	 * important so that your control can automatically be type checked, documented, 
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
		
		return [
			{
				'name': 'theme',
				'optional': true,
				'description': 'name of theme to use for this control',
				'type': T.identifier
			}
		];
	},
	/**
	 * The version of the control. This will automatically be corrected when you
	 * publish the component.
	 */
	getVersion: function()
	{
		// leave this as-is and only configure from the build.yml file 
		// and this will automatically get replaced on build of your distro
		return '__VERSION__';
	},
	/**
	 * The control spec version.  This is used to maintain backwards compatability as the
	 * Widget API needs to change.
	 */
	getSpecVersion: function()
	{
		return 1.0;
	},
	/**
	 * This is called when the control is loaded and applied for a specific element that 
	 * references (or uses implicitly) the control.
	 */
	build: function(element,options)
	{
		var theme = options['theme'] || Appcelerator.UI.UIManager.getDefaultTheme('NAME')
		Element.addClassName(element,"_NAME" + theme);
		
		
		// NOTE: you must always call load theme before returning from build for the 
		// framework to dynamically apply the appropriate theme for this control
		Appcelerator.Core.loadTheme('type','NAME',theme,element,options);	
	}
});
