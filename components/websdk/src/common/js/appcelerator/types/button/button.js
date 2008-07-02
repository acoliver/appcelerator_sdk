Appcelerator.UI.registerUIComponent('type','button',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [
				{name: 'width', optional: true, description: " width for panel" ,defaultValue: 'auto', type: T.cssDimension}];
	},
	disable:function(id,parameters,data,scope,version,attrs,direction,action)
	{
		Appcelerator.UI.ContainerManager.button.disableButton(id);
	},
	enable:function(id,parameters,data,scope,version,attrs,direction,action)
	{
		Appcelerator.UI.ContainerManager.button.enableButton(id);
	},
	enableButton : function(id)
	{
		var theme = $(id).theme;
		Element.removeClassName(id + "_left","button_" + theme + "_left_disabled");
		Element.removeClassName(id + "_middle","button_" + theme + "_middle_disabled");
		Element.removeClassName(id + "_right","button_" + theme + "_right_disabled");
		$(id).removeAttribute("disabled");
	},
	disableButton : function(id)
	{
		var theme = $(id).theme;
		Element.addClassName(id + "_left","button_" + theme + "_left_disabled");
		Element.addClassName(id + "_middle","button_" + theme + "_middle_disabled");
		Element.addClassName(id + "_right","button_" + theme + "_right_disabled");		
		$(id).setAttribute("disabled","true");
	},
	getActions: function()
	{
		return ['disable','enable'];
	},
	build: function(element,options)
	{
		var theme = options['theme'];
		var classPrefix = "button_" +theme;
		element.theme = theme;
		
		var html = '<div class="'+classPrefix+'">';
		html += '<div id="'+element.id+'_left" class="'+classPrefix+'_left"></div>';		
		html += '<div id="'+element.id+'_middle" class="'+classPrefix+'_middle" style="width:'+options['width']+'">'+element.innerHTML+'</div>';
		html += '<div id="'+element.id+'_right" class="'+classPrefix+'_right"></div>';		
		html += '</div>';			
		element.innerHTML = html;
		element.style.border="none"
		element.style.background = "transparent";
		
		// IE NEEDS A WIDTH		
		if ((element.style.width == '' || element.style.width == "auto") && (Appcelerator.Browser.isIE))
		{
			element.style.width = '100px';
		}
		var self = this;
		
		// check initial state of button
		if (element.disabled)
		{
			self.disableButton(element.id);			
		}
		
		Appcelerator.Core.loadTheme('type','button',theme);
		
		
		if (element.getAttribute('activators'))
		{
			element.onActivatorsDisable = function()
			{
				self.disableButton(element.id);
			};
			element.onActivatorsEnable = function()
			{
				self.enableButton(element.id);
			};
		}
	}
});
