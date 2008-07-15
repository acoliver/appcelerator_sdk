Appcelerator.UI.registerUIComponent('behavior','draggable',
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
	build:  function(element,options)
	{
		// we want to wait until we're compiled before we attached our draggable
		// given that we can have a handle reference id inside the container we 
		// want to use and we need to make sure we can get the ID before we pass
		// to draggable
		element.observe('element:compiled:'+element.id,function(a)
		{
			var container = element.up('.container');
			if (options.endeffect)
			{
				var name = options.endeffect;
				options.endeffect = function()
				{
					 element.visualEffect(name,options);
				};
			}
			if (options.starteffect)
			{
				var name = options.starteffect;
				options.starteffect = function()
				{
					 element.visualEffect(name,options);
				};
			}
			if (options.reverteffect)
			{
				var name = options.reverteffect;
				options.reverteffect = function()
				{
					 element.visualEffect(name,options);
				};
			}
			if (options.revert)
			{
				var f = window[options.revert];
				if (Object.isFunction(f))
				{
					options.revert = f;
				}
			}
			var d = new Draggable(container.id,options);
			Appcelerator.Compiler.addTrash(container,function()
			{
				d.destroy();
			});
		});
	}
});
