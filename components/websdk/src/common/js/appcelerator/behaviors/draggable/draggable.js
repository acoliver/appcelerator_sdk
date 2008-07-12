Appcelerator.UI.registerUIComponent('behavior','draggable',
{
	getAttributes: function()
	{
		return [];
	},
	build: function(element,options)
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
