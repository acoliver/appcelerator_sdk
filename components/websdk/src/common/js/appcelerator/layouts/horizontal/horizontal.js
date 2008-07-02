Appcelerator.UI.registerUIComponent('layout','horizontal',
{	
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'width', optional: true, description: "width for horizontal layout",defaultValue: '100%'},
			    {name: 'spacing', optional: true, description: "cell spacing for horizontal layout",defaultValue: '0'},
		        {name: 'padding', optional: true, description: "cell padding for horizontal layout",defaultValue: '0'}	
		];
	},
	build: function(element,options)
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