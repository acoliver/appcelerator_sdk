
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
	compileWidget: function(params)
	{
		var id = params['id'];
		var element = $(id);
		var initial = params['initial'];
		var initialNode = params['initialNode'];
		var selectedTab = null;
		var tabs = params['tabs'];
		var activeClassName = params['activeClassName'];
		var inactiveClassName = params['inactiveClassName'];
		
		if (initial)
		{
			//
			// go ahead and set the initial state
			// and invoke appropriate listeners 
			//
			if (Appcelerator.Compiler.StateMachine.initialStateLoaders)
			{
				Appcelerator.Compiler.StateMachine.initialStateLoaders.push([id,initial]);
			}
			
			// set the activate classname
			selectedTab = $(initialNode);
			Element.removeClassName(selectedTab, inactiveClassName);
			Element.addClassName(selectedTab, activeClassName);
		}
		
		Appcelerator.Compiler.attachFunction(element, 'executeEnable', function()
		{
			Appcelerator.Compiler.StateMachine.enableStateMachine(id);
		});

		Appcelerator.Compiler.attachFunction(element, 'executeDisable', function()
		{
			Appcelerator.Compiler.StateMachine.disableStateMachine(id);
		});

		//
		// wire up our listeners
		//
		for (var c=0,len=tabs.length;c<len;c++)
		{
			var tab = $(tabs[c][1]);
			tab.state = tabs[c][0];
			tab.onclick = function(e)
			{
				Appcelerator.Compiler.StateMachine.fireStateMachineChange(id, this.state, true);
				if (selectedTab)
				{
					Element.removeClassName(selectedTab, activeClassName);
					Element.addClassName(selectedTab, inactiveClassName);
				}
				
				Element.removeClassName(this, inactiveClassName);
				Element.addClassName(this, activeClassName);
				
				selectedTab = this;
			};
			
			tab.onmouseover = function()
			{
				if (selectedTab != this)
				{
					this.className += ' ' + activeClassName;
				}
			};
			
			tab.onmouseout = function()
			{
				if (selectedTab != this)
				{
					this.className = this.className.gsub(' ' + activeClassName,'');
				}
			};

			Appcelerator.Compiler.delegateToAttributeListeners(tabs[c][2]);
			
			// copy styles from tab into new tab
			var cl = tabs[c][2].getAttribute("class");
			if (cl)
			{
				Element.addClassName(tab, cl);
			}
			tab.style.display = '';
		}		
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
				Appcelerator.Compiler.StateMachine.addState(id,name,null);
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
		}

		var params = {};
		params['id'] = id;
		params['initial'] = initial;
		params['initialNode'] = initialNode;
		params['tabs'] = tabs;
		params['activeClassName'] = activeClassName;
		params['inactiveClassName'] = inactiveClassName;

		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'initialization' : Appcelerator.Module.Tabpanel.compileWidget,
			'initializationParams' : params,
			'wire':true
		};
	}
};


Appcelerator.Core.registerModule('app:tabpanel',Appcelerator.Module.Tabpanel);
Appcelerator.Core.loadModuleCSS('app:tabpanel','tabpanel.css');