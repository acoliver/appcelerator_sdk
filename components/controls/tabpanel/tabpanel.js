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

Appcelerator.UI.registerUIComponent('control','tabpanel',
{
	/**
	 * The attributes supported by the controls. This metadata is 
	 * important so that your control can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'theme', optional: true, description: "theme for the panel",defaultValue: Appcelerator.UI.UIManager.getDefaultTheme('tabpanel')},
				{name: 'initial', optional: false, description: "the initial active tab"}];
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
	build:  function(element,options)
	{
		var classPrefix = 'tabpanel_' + options['theme'] || Appcelerator.UI.UIManager.getDefaultTheme('tabpanel');
		var container = document.createElement("div");

		// add left end of tab
		var html = '<ul style="margin:0;float:left;list-style-type:none"><li id="'+element.id+'_left" class="'+classPrefix+'_left"></li>';
		
		var tabCount = 0;
 		for (var c=0,len=element.childNodes.length;c<len;c++)
		{
			var node = element.childNodes[c];
			if (node.nodeType == 1)
			{
				tabCount++;
				var tabName = node.getAttribute("name");
				if (!tabName)
				{
					Appcelerator.Compiler.handleElementException(element,null,'name attribute is required for each tab, id = ' + node.innerHTML);		
					return;
				}
				Appcelerator.Compiler.StateMachine.addState(element.id,tabName,null);

				if (options['initial'] == tabName)
				{
					html += '<li id="'+element.id+'_tableft_'+tabCount+'"  class="'+classPrefix+'_tab_left '+classPrefix+'_tab_left_active" on="'+element.id+'['+tabName+'] then add[class='+classPrefix+'_tab_left_active] else remove[class='+classPrefix+'_tab_left_active]"></li>';
					html += '<li id="'+element.id+'_tabmid_'+tabCount+'"   class="'+classPrefix+'_tab_mid '+classPrefix+'_tab_mid_active" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_tab_mid_active] else remove[class='+classPrefix+'_tab_mid_active]">'+node.innerHTML+'</li>';
					html += '<li id="'+element.id+'_tabright_'+tabCount+'" class="'+classPrefix+'_tab_right '+classPrefix+'_tab_right_active" on="'+element.id+'['+tabName+'] then add[class='+classPrefix+'_tab_right_active] else remove[class='+classPrefix+'_tab_right_active]"></li>';
				}
				else
				{
					html += '<li id="'+element.id+'_tableft_'+tabCount+'"  class="'+classPrefix+'_tab_left" on="'+element.id+'['+tabName+'] then add[class='+classPrefix+'_tab_left_active] else remove[class='+classPrefix+'_tab_left_active]"></li>';
					html += '<li id="'+element.id+'_tabmid_'+tabCount+'"   class="'+classPrefix+'_tab_mid" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_tab_mid_active] else remove[class='+classPrefix+'_tab_mid_active]">'+node.innerHTML+'</li>';
					html += '<li id="'+element.id+'_tabright_'+tabCount+'" class="'+classPrefix+'_tab_right" on="'+element.id+'['+tabName+'] then add[class='+classPrefix+'_tab_right_active] else remove[class='+classPrefix+'_tab_right_active]"></li>';
				}

			}
		}
		
		// right end of tab panel
		html += '<li id="'+element.id+'_right" class="'+classPrefix+'_right"></li>';
		// end of div + divivder
		html += '</ul><div class="'+classPrefix+'_divider"></div>';
		container.innerHTML = html;
		element.innerHTML = '';
		element.appendChild(container);		
		Appcelerator.Compiler.dynamicCompile(container);


		// deal with IE PNG issue
		if (Appcelerator.Browser.isIE6)
		{
			$(element.id +"_left").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');	
			$(element.id +"_right").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');	
			
			for (var i=1;i<=tabCount;i++)
			{
				$(element.id +"_tableft_"+i).addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');	
				$(element.id +"_tabmid_"+i).addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');	
				$(element.id +"_tabright_"+i).addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');	
			}
		}

		Appcelerator.Core.loadTheme('type','tabpanel',options['theme'],element,options);	
	}
});
