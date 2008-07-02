Appcelerator.UI.registerUIComponent('type','tabpanel',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'theme', optional: true, description: "theme for the panel",defaultValue: 'basic'},
				{name: 'initial', optional: false, description: "the initial active tab"}];
	},
	
	build: function(element,options)
	{
		var classPrefix = 'tabpanel_' + options['theme'];
		var container = document.createElement("div");

		var html = '<div class="'+classPrefix+'">';
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
					if (node.style.width != "")
					{
						html += '<div style="width:'+node.style.width+'" class="'+classPrefix+'_hdr '+classPrefix+'_hdr_active" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_hdr_active] else remove[class='+classPrefix+'_hdr_active]">';
					}
					else
					{
						html += '<div class="'+classPrefix+'_hdr '+classPrefix+'_hdr_active" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_hdr_active] else remove[class='+classPrefix+'_hdr_active]">';

					}
					
					html += '<div class="'+classPrefix+'_tr '+classPrefix+'_tr_active" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_tr_active] else remove[class='+classPrefix+'_tr_active]"></div>';
					html += '<div class="'+classPrefix+'_tl '+classPrefix+'_tl_active" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_tl_active] else remove[class='+classPrefix+'_tl_active]"></div>';
					html += node.innerHTML + '</div>';
				}
				else
				{
					if (node.style.width != "")
					{
						html += '<div style="width:'+node.style.width+'" class="'+classPrefix+'_hdr" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_hdr_active] else remove[class='+classPrefix+'_hdr_active]">';
					}
					else
					{
						html += '<div class="'+classPrefix+'_hdr" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_hdr_active] else remove[class='+classPrefix+'_hdr_active]">';

					}
					
					html += '<div class="'+classPrefix+'_tr" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_tr_active] else remove[class='+classPrefix+'_tr_active]"></div>';
					html += '<div class="'+classPrefix+'_tl" on="click then statechange['+element.id+'='+tabName+'] or '+element.id+'['+tabName+'] then add[class='+classPrefix+'_tl_active] else remove[class='+classPrefix+'_tl_active]"></div>';
					html += node.innerHTML + '</div>';
				}

			}
		}
		html += '</div><div class="'+classPrefix+'_divider"></div>';
		container.innerHTML = html;
		element.innerHTML = '';
		element.appendChild(container);		
		Appcelerator.Compiler.dynamicCompile(container);
		Appcelerator.Core.loadTheme('type','tabpanel',options['theme']);	
	}
});
