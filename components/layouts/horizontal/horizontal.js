Appcelerator.UI.registerUIComponent('layout','horizontal',
{
	/**
	 * The attributes supported by the layouts. This metadata is 
	 * important so that your layout can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		
		/*
		Example: 
		return [{name: 'mode', optional: false, description: "Vertical or horizontal alignment",
		         type: T.enumeration('vertical', 'horizontal')}]
		*/
		
		//TODO
		return [];
	},
	/**
	 * The version of the layout. This will automatically be corrected when you
	 * publish the component.
	 */
	getVersion: function()
	{
		// leave this as-is and only configure from the build.yml file 
		// and this will automatically get replaced on build of your distro
		return '__VERSION__';
	},
	/**
	 * The layout spec version.  This is used to maintain backwards compatability as the
	 * Widget API needs to change.
	 */
	getSpecVersion: function()
	{
		return 1.0;
	},
	/**
	 * This is called when the layout is loaded and applied for a specific element that 
	 * references (or uses implicitly) the layout.
	 */
	build:  function(element,options)
	{
		var html = Appcelerator.UI.LayoutManager._formatTable(options);
		html += '<tr>';
		var position = {'tl':{'code':' valign="top" align="left"'},
						'tr':{'code':' valign="top" align="right"'},
						'tc':{'code':' valign="top" align="center"'},
						'ml':{'code':' valign="middle" align="left"'},
						'mr':{'code':' valign="middle" align="right"'},
						'mc':{'code':' valign="middle" align="center"'},
						'bl':{'code':' valign="bottom" align="left"'},
						'br':{'code':' valign="bottom" align="right"'},
						'bc':{'code':' valign="bottom" align="center"'}
		};
		
		for (var c=0,len=element.childNodes.length;c<len;c++)
		{
			var node = element.childNodes[c];
			if (node.nodeType == 1)
			{
				html += '<td ';
				if (node.getAttribute("props"))
				{
					var args = Appcelerator.UI.UIManager.attrToJSON(node.getAttribute("props"));
					if (args['width'])
					{
						html+= ' width=' + args['width'];
					}
					if (args['pos'])
					{
						if (position[args['pos']])
						{
							html+= position[args['pos']]['code'];				
						}
					}
				}
				html += '>';
				if (Appcelerator.Browser.isIE)
				{
					html += node.outerHTML;	
				}
				else
				{
					html += Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node));	
				}
				html += '</td>';
			}
		}
		html +="</tr></table>";
		element.innerHTML = html;
	}
});
