Appcelerator.UI.registerUIComponent('behavior','shadow',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'theme', optional: true, description: "theme for the shadow",defaultValue: 'basic'}];
	},
	build: function(element,options)
	{
		var d1 = document.createElement("div");
		d1.className = "shadow_" + options['theme'] + "_1";
		var d2 = document.createElement("div");
		d2.className = "shadow_" + options['theme'] + "_2";
		var d3 = document.createElement("div");
		d3.className = "shadow_" + options['theme'] + "_3";;
		var d4 = document.createElement("div");
		var outerNode = element.parentNode;
		outerNode.insertBefore(d1, element);
		d1.appendChild(d2);
	 	d2.appendChild(d3);
		outerNode.removeChild(element);
		d3.appendChild(element);
		var clearDiv = document.createElement("div");
		clearDiv.style.clear = "both";
		new Insertion.After(d1, clearDiv);
		
		Appcelerator.Core.loadTheme('behavior','shadow',options['theme']);		
	}
});