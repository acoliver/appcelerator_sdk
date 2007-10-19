
Appcelerator.Module.Tabpanel =
{
	getName: function()
	{
		return 'appcelerator tabpanel';
	},
	getDescription: function()
	{
		return 'tabpanel widget';
	},
	getVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Jeff Haynie';
	},
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'app:tabpanel';
	},
	execute: function(id,parameterMap,data,scope)
	{

	},
	buildWidget: function(element)
	{
		var tabs = [];
		var on = element.getAttribute('on');
		var initial = element.getAttribute('initial');
		var activeClassName = element.getAttribute('activeClassName') || 'tab_active';
		var inactiveClassName = element.getAttribute('inactiveClassName') || 'tab_inactive';
		var className = element.getAttribute('class') || 'tabpanel';
		var id = element.id;
		var initialFound = false;
		var initialNode = null;
		var selectedTab = null;
		var code = '';
		
		if (className)
		{
			element.removeAttribute('class');
		}

		var html = '<div id="parent_'+id+'">';
		html += '<div id="' + id + '" ' + (className ? 'class="' + className + '"' : '')+' ' + (on ? 'on="' + on + '"' : '') + '><table style="padding: 0; margin: 0" cellpadding="0" cellspacing="0"><tr>\n';

		if (Appcelerator.Browser.isIE)
		{
			// NOTE: in IE, you have to append with namespace
			var newhtml = element.innerHTML;
			newhtml = newhtml.replace(/<TAB/g,'<APP:TAB');
			newhtml = newhtml.replace(/\/TAB>/g,'/APP:TAB>');
			element.innerHTML = newhtml;
		}
		
		for (var c=0,len=element.childNodes.length;c<len;c++)
		{
			var node = element.childNodes[c];
			
			if (node.nodeType == 1 && node.nodeName.toLowerCase() == 'tab')
			{
				var name = node.getAttribute('name');
				var langid = node.getAttribute('langid');
				var tabHtml = null;
				if (langid)
				{
					tabHtml = Appcelerator.Localization.get(langid);
					if (tabHtml)
					{
						node.removeAttribute('langid');
					}
				}
				if (!tabHtml)
				{
					tabHtml = Appcelerator.Compiler.getHtml(node);
				}
				var tabId = id + '_' + name;
				html+='<td><div id="' + tabId + '" ' + (inactiveClassName?'class="tabpanel_tab '+inactiveClassName+'" ':'tabpanel_tab')+' '+Appcelerator.Util.Dom.getAttributesString(element)+'><a>' + tabHtml + '</a></div></td>\n';
				
				if (!initialFound && initial && initial == name)
				{
					initialFound = true;
					initialNode = tabId;
				}
				else if (!initial && !initialFound)
				{
					initialFound = true;
					initialNode = tabId;
					initial = name;
				}
				code += 'Appcelerator.Compiler.StateMachine.addState("'+id+'","'+name+'",null);';
				tabs.push([name,tabId,node]);
			}
		}
		
		html+='</tr></table></div></div>';

		if (initial)
		{
			if (!initialFound)
			{
				throw "invalid initial state - couldn't find state: "+initial+" for "+id;
			}
			//
			// go ahead and set the initial state
			// and invoke appropriate listeners 
			//
			code += 'if (Appcelerator.Compiler.StateMachine.initialStateLoaders)';
			code += '{';
			code += 'Appcelerator.Compiler.StateMachine.initialStateLoaders.push(["'+id+'","'+initial+'"]);';
			code += '}';
			
			// set the activate classname
			code += 'var selectedTab'+id+'=$("'+initialNode+'");';
			code += 'Element.removeClassName(selectedTab'+id+',"'+inactiveClassName+'");';
			code += 'Element.addClassName(selectedTab'+id+',"'+activeClassName+'");';
		}
		
		code += 'Appcelerator.Compiler.attachFunction($("'+id+'"),"executeEnable",function()';
		code += '{';
		code +=	'Appcelerator.Compiler.StateMachine.enableStateMachine("'+id+'");'
		code += '});';

		code += 'Appcelerator.Compiler.attachFunction($("'+id+'"),"executeDisable",function()';
		code += '{';
		code +=	'Appcelerator.Compiler.StateMachine.disableStateMachine("'+id+'");'
		code += '});';

		//
		// wire up our listeners
		//
		for (var c=0,len=tabs.length;c<len;c++)
		{
			code += '{';

			code += 'var tab=$("'+tabs[c][1]+'");';
			code += 'tab.state = "'+tabs[c][0]+'";';
			code += 'tab.onclick = function(e)';
			code += '{';
			code += 'Appcelerator.Compiler.StateMachine.fireStateMachineChange("'+id+'",this.state,true);';
			code += 'if (selectedTab'+id+')';
			code += '{';
			code += 'Element.removeClassName(selectedTab'+id+',"'+activeClassName+'");';
			code += 'Element.addClassName(selectedTab'+id+',"'+inactiveClassName+'");';
			code += '}';
			code += 'Element.removeClassName(this,"'+inactiveClassName+'");';
			code += 'Element.addClassName(this,"'+activeClassName+'");';
			code += 'selectedTab'+id+'= this;';			
			code += '};';
			
			code += 'tab.onmouseover = function()';
			code += '{ if (selectedTab'+id+' != this) { this.className+=" tab_active"; }';
			code += '};';

			code += 'tab.onmouseout = function(e)';
			code += '{;';
			code += 'if (selectedTab'+id+' != this)';
			code += '{ this.className=this.className.replace(new RegExp(" tab_active\\\\b"), "");}';
			code += '};';
			
			// delegate to any attribute listeners
			code += Appcelerator.Compiler.delegateToAttributeListeners(tabs[c][2])+";";			
			
			// copy styles from tab into new tab
			var cl = tabs[c][2].getAttribute("class");
			if (cl)
			{
				code += 'Element.addClassName(tab,"'+cl+'");';
			}
			code += 'tab.style.display="";';
			
			code += '}';
		}

		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'initialization' : code,
			'wire':true
		};
	}
};


Appcelerator.Core.registerModule('app:tabpanel',Appcelerator.Module.Tabpanel);
Appcelerator.Core.loadModuleCSS('app:tabpanel','tabpanel.css');