
Appcelerator.Module.Box =
{
	getName: function()
	{
		return 'appcelerator box';
	},
	getDescription: function()
	{
		return 'box widget';
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
		return 'Nolan Wright';
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
		return 'app:box';
	},
	getAttributes: function()
	{
		return [{name: 'mode', optional: false, description: "Vertical or horizontal alignment"},
				{name: 'width', optional: true, defaultValue: '100%'},
				{name: 'verticalAlign', optional: true, defaultValue: 'top'},
				{name: 'cellpadding', optional: true, defaultValue: '0'}];
	},
	buildWidget: function(element,parameters)
	{
		var mode = parameters['mode'];
		var width = parameters['width'];
		var verticalAlign = parameters['verticalAlign'];
		var cellPadding = parameters['cellpadding'];
		
		var html = '<div style="width:'+width+';';
		html+='margin-top:'+parseInt(Element.getStyle(element,'margin-top') || element.getAttribute('margin') || 0) + 'px;';
		html+='margin-bottom:'+parseInt(Element.getStyle(element,'margin-bottom') || element.getAttribute('margin') || 0) + 'px;';
		html+='margin-left:'+parseInt(Element.getStyle(element,'margin-left') || element.getAttribute('margin') || 0) + 'px;';
		html+='margin-right:'+parseInt(Element.getStyle(element,'margin-right') || element.getAttribute('margin') || 0) + 'px;';

		html+='padding-top:'+parseInt(Element.getStyle(element,'padding-top') || element.getAttribute('padding') || 0) + 'px;';
		html+='padding-bottom:'+parseInt(Element.getStyle(element,'padding-bottom') || element.getAttribute('padding') || 0) + 'px;';
		html+='padding-left:'+parseInt(Element.getStyle(element,'padding-left') || element.getAttribute('padding') || 0) + 'px;';
		html+='padding-right:'+parseInt(Element.getStyle(element,'padding-right') || element.getAttribute('padding') || 0) + 'px;';
		
		html+='border-top:'+(Element.getStyle(element,'border-top') || element.getAttribute('border') || 'none')+';';
		html+='border-bottom:'+(Element.getStyle(element,'border-bottom') || element.getAttribute('border') || 'none')+';';
		html+='border-left:'+(Element.getStyle(element,'border-left') || element.getAttribute('border') || 'none')+';';
		html+='border-right:'+(Element.getStyle(element,'border-right') || element.getAttribute('border') || 'none')+';';
		
		html+='background-color:'+(Element.getStyle(element,'background-color') || element.getAttribute('background-color') || 'transparent')+';';
		html +='">';
		html +='<table border="1" width="100%" cellspacing="0" cellpadding="0">';		

		if (Appcelerator.Browser.isIE)
		{
			var innerhtml = element.innerHTML;
			innerhtml = Appcelerator.Compiler.specialMagicParseHtml(innerhtml);
			element.innerHTML = innerhtml;
		}
		
		if (mode == "vertical")
		{
			for (var c=0,len=element.childNodes.length;c<len;c++)
			{
				var node = element.childNodes[c];
				if (node.nodeType == 1)
				{
					html += '<tr>';
					var widthString = '';
					if (node.getAttribute("width"))
					{
						widthString = ' width="' + node.getAttribute("width") +'" ';
					}
					if (cellPadding)
					{
						html += '<td '+widthString +' valign="'+verticalAlign+'" style="padding:' + cellPadding + '">';
					}
					else
					{
						html += '<td '+widthString +' valign="'+verticalAlign+'">';
					}
					if (Appcelerator.Browser.isIE)
					{
						html += node.outerHTML;	
					}
					else
					{
						html += Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node));	
					}
					html += '</td></tr>';
				}
			}
		}
		else if (mode == "horizontal")
		{
			html +='<tr>';
			for (var c=0,len=element.childNodes.length;c<len;c++)
			{
				var node = element.childNodes[c];
				if (node.nodeType == 1)
				{
					var widthString = '';
					if (node.getAttribute("width"))
					{
						widthString = ' width="' + node.getAttribute("width") +'" ';
					}
					if (cellPadding)
					{
						html += '<td '+widthString +' valign="'+verticalAlign+'" style="padding:' + cellPadding + '">';
					}
					else
					{
						html += '<td '+widthString +' valign="'+verticalAlign+'"	>';
					}
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
			html +='</tr>';
		}
		
		html+= '</table></div>';
		
		return {
			'presentation' : Appcelerator.Compiler.specialMagicParseHtml(html),
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'wire' : true
		};		
	}
};

Appcelerator.Core.registerModule('app:box',Appcelerator.Module.Box);