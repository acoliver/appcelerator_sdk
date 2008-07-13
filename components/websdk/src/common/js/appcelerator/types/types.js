Appcelerator.UI.ContainerManager = {};

Appcelerator.UI.registerUIManager('type',function(type,element,options,callback)
{
	Element.addClassName(element,type);
	Appcelerator.UI.loadUIComponent('type',type,element,options,false,callback);
});

Appcelerator.UI.getTabs = function(element)
{
	var tabs = [];
	var nodes = element.childNodes;
	for (var i=0;i<nodes.length;i++)
	{
		if (nodes[i].nodeType == 1 && nodes[i].nodeName.toUpperCase() == "DIV")
		{
			var ulNodes = nodes[i].childNodes;
			for (var j=0;j<ulNodes.length;j++)
			{
				if (ulNodes[j].nodeType == 1 && ulNodes[j].nodeName.toUpperCase() == "UL")
				{
					var liNodes = ulNodes[j].childNodes
					for (var k=0;k<liNodes.length;k++)
					{
						if (liNodes[k].nodeType == 1 && liNodes[k].nodeName.toUpperCase() == "LI")
						{
							tabs.push(liNodes[k]);
						}
					}
				}
			}
		}
	}
	return tabs;
};
/**
 * WIRES LISTENER 
 */
Appcelerator.UI.registerListener('type','tabpanel','afterBuild',function()
{
	if (this.args.theme == 'minimal')
	{
		var tabs = Appcelerator.UI.getTabs(this.element);
		
		// create hoverbox
		var hoverBox = document.createElement('li');
		Element.addClassName(hoverBox,'tabpanel_minimal_hoverbox');
		hoverBox.id = this.element.id + "_hoverbox";
		hoverBox.style.position = "relative";
		hoverBox.style.left = "105px";
		new Insertion.Before(tabs[0],hoverBox);

		var tabCount = (tabs.length-2)/3;
		var self = this;
		
		// add tab listeners
		for (var i=1;i<=tabCount;i++)
		{
			var tab = $(this.element.id + '_tabmid_' + i);
			var self = this;
			Event.observe(tab,'mouseover',function(event)
			{
				var newSlot = Event.element(event).offsetLeft;
				new Effect.MoveBy($(self.element.id + "_hoverbox"), 0, newSlot-($(self.element.id + "_hoverbox").offsetLeft-5),{duration: 2, transition: Effect.Transitions.SwingTo});
				return false;
			});
			
		}
		
	}
	if (this.args.theme == 'gradient_stacked')
	{
		$(this.element.id + "_left").innerHTML = (this.args.title)?this.args.title:'No Title';
	}
	else if (this.args.theme == 'box')
	{
		var tabs = Appcelerator.UI.getTabs(this.element);
		var tabCount = (tabs.length-2)/3;
		if (this.args.behavior == 'harddrop')
		{
			for (var i=1;i<=tabCount;i++)
			{
				var tab = $(this.element.id + '_tabmid_' + i);
				var self = this;
				Event.observe(tab,'click',function(event)
				{
					new Effect.Morph(Event.element(event),{style:'height:30px',duration:1.0,transition:Effect.Transitions.Bounce});
					for (var j=1;j<=tabCount;j++)
					{
						var tab = $(self.element.id + '_tabmid_' + j)
						if (tab.id != Event.element(event).id)
						{
							new Effect.Morph(tab,{style:'height:10px',duration:1.0,transition:Effect.Transitions.Bounce});
						}
					}
				});
				
			}
		}
		else if (this.args.behavior == 'wires')
		{
			for (var i=1;i<=tabCount;i++)
			{
				var tab = $(this.element.id + '_tabmid_' + i);
				var string = document.createElement('li');
				new Insertion.Before(tab,string);
				string.id = this.element.id + '_tabmid_' + i+ '_string_' + i;
				Element.addClassName(string,'tabpanel_box_wire');
				var self = this;
				Event.observe(tab,'click',function(event)
				{
					var tabNum = Event.element(event).id.substring(Event.element(event).id.length-1);
					new Effect.Morph(Event.element(event),{style:'top:30px',duration:1.0,transition:Effect.Transitions.BouncePast});
					new Effect.Morph($(Event.element(event).id + "_string_" + tabNum),{style:'height:60px',duration:0.5});

					for (var j=1;j<=tabCount;j++)
					{
						var tab = $(self.element.id + '_tabmid_' + j);
						var string = $(self.element.id + '_tabmid_'+j+'_string_' + j);
						if (tab.id != Event.element(event).id)
						{
							new Effect.Morph(tab,{style:'top:0px',duration:1.0,transition:Effect.Transitions.BouncePast});
							new Effect.Morph(string,{style:'height:20px',duration:0.5});
						}
					}
				});
				
			}
		}

	}
});

