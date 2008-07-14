Appcelerator.Core.registerTheme('tabpanel','minimal',{
  build: function(element,options)
  {
		var tabs = Appcelerator.UI.getTabs(element);
		
		// create hoverbox
		var hoverBox = document.createElement('li');
		Element.addClassName(hoverBox,'tabpanel_minimal_hoverbox');
		hoverBox.id = element.id + "_hoverbox";
		hoverBox.style.position = "relative";
		hoverBox.style.left = "105px";
		new Insertion.Before(tabs[0],hoverBox);

		var tabCount = (tabs.length-2)/3;
		var id = element.id;
		
		// add tab listeners
		for (var i=1;i<=tabCount;i++)
		{
			(function()
			{
				var tab = $(id + '_tabmid_' + i);
				Event.observe(tab,'mouseover',function(event)
				{
					var newSlot = Event.element(event).offsetLeft;
					new Effect.MoveBy($(id + "_hoverbox"), 0, newSlot-($(id + "_hoverbox").offsetLeft-5),{duration: 2, transition: Effect.Transitions.SwingTo});
					return false;
				});
			})();
		}
  }
});
