/*
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


Appcelerator.Widget.Tabpanel =
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
	getSpecVersion: function()
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
	getAttributes: function()
	{
        var T = Appcelerator.Types;
        return [{
            name: 'on',
            optional: true,
			type: T.onExpr,
            description: "May be used to add an expression to the entire tab panel."
        }, {
            name: 'initial',
            optional: true,
			
            description: "Indicates which tab panel will initially be active."
        }, {
            name: 'color',
            defaultValue: '',
            optional: true,
            type: T.enumeration('light_gray', 'dark_gray'),
            description: 'The color scheme of the widget. Default is to apply no colors.  Supported schemes: light_gray, dark_gray'
        }, {
            name: 'tab_spacing',
            defaultValue: '3px',
            optional: true,
            type: T.cssDimension,
            description: "Describes how much space to put between tabs"
        }, {
            name: 'class',
            defaultValue: 'tabpanel',
            optional: true,
			type: T.cssClass,
            description: "The class name to use for the entire tab panel. Defaults to 'tabpanel.'" +
                "Note, setting this will disable built-in styling."
        }];
	},
	compileWidget: function(params)
	{
		var id = params['id'];
		var element = $(id);
		var initial = params['initial'];
		var initialNode = params['initialNode'];
		var selectedTab = null;
		var tabs = params['tabs'];
		var activeClassName = 'tabpanel_active';
		var inactiveClassName = 'tabpanel_inactive';
        var hoverClassName ="tabpanel_hover"
		
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
        // set the tab spacing
        //
        var tabSpacing = params['tab_spacing'];
        var renderedTabs = Element.getElementsByClassName(id, 'tabpanel_tab');
        renderedTabs.each(function(myTab) 
        {
           myTab.style.marginRight = tabSpacing;
        });
        
		//
		// wire up our listeners
		//
		for (var c=0,len=tabs.length;c<len;c++)
		{
			var tab = $(tabs[c][1]);
            Appcelerator.Compiler.StateMachine.addState(id,tabs[c][0],null);
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
				Element.removeClassName(this, hoverClassName);
				Element.addClassName(this, activeClassName);
				
				selectedTab = this;
			};
			
			tab.onmouseover = function()
			{
				if (selectedTab != this)
				{
                    Element.addClassName(this, hoverClassName);
				}
			};
			
			tab.onmouseout = function()
			{
				if (selectedTab != this)
				{
                    Element.removeClassName(this, hoverClassName);
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
	buildWidget: function(element, parameters)
	{
		var tabs = [];
		var on = parameters['on'];
		var initial = parameters['initial'];
        var activeClassName = 'tab_active';
        var inactiveClassName = 'tab_inactive';
		var className = parameters['class'];
		var id = element.id;
		var initialFound = false;
		var initialNode = null;
		var selectedTab = null;
		var code = '';

        var color = '';
        if(parameters['color'] == 'dark_gray')
        {
            color = "AP_DGSP";
        }
        else if(parameters['color'] == 'light_gray')
        {
            color = "AP_LGSP";
        }
        
		var html = '<div id="parent_'+id+'" class="' + color + '">';
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
				html+='<td><div id="' + tabId + '" class="tabpanel_tab tabpanel_inactive"'+Appcelerator.Util.Dom.getAttributesString(element)+'><a>' + tabHtml + '</a></div></td>\n';
				
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

		parameters['id'] = id;
		parameters['initialNode'] = initialNode;
		parameters['tabs'] = tabs;

		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'compile' : true,
			'wire':true
		};
	}
};


Appcelerator.Core.loadModuleCSS('app:tabpanel','tabpanel.css');
Appcelerator.Widget.register('app:tabpanel',Appcelerator.Widget.Tabpanel);
