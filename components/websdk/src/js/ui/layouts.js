Appcelerator.UI.LayoutManager = {};
Appcelerator.UI.LayoutManager._formatTable = function(options)
{
   return '<table width="'+options['width']+'" cellspacing="'+(options['cellspacing'] || '') +'" cellpadding="'+ (options['cellpadding'] || '0') + '">';
};

Appcelerator.UI.LayoutManager._buildForm = function(options)
{
	var childNodes = options['childNodes'];
	var html = options['html'];
	var align = options['align'];
	var colspan = options['colspan'];
	var hintPos = options['hintPos'];
	var errorPos = options['errorPos'];
	var buttonPos = options['buttonPos'];
	var labelWidth = options['labelWidth'];
	var formElement = options['element'];
	
	var defaultFieldset = formElement.getAttribute('fieldset') || formElement.id+'_fieldset';
	
	var inputHTML = [];
	var labelHTML = [];
	var buttonHTML = [];
	var hintHTML = [];
	var errorHTML = [];
	for (var c=0,len=childNodes.length;c<len;c++)
	{
		var node = childNodes[c];
		if (node.nodeType == 1)
		{
			switch (node.tagName.toLowerCase())
			{
				case 'input':
				case 'select':
				case 'textarea':
				{
					if (node.getAttribute('type') == 'button')
					{
						if (Appcelerator.Browser.isIE)
						{
							buttonHTML.push(node.outerHTML);
						}
						else
						{
							buttonHTML.push(Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node)));	
						}
					}
					else
					{
						var fs = node.getAttribute('fieldset');
						if (!fs)
						{
							node.setAttribute('fieldset',defaultFieldset);
						}
						inputHTML.push({'element':node});
					}
					break;
				}
				case 'label':
				{
					if (Appcelerator.Browser.isIE)
					{
						if (node.getAttribute("type") == "hint")
						{
							hintHTML.push({'id':node.htmlFor,'element':node,'html':node.outerHTML});
						}
						else if (node.getAttribute("type") == "error")
						{
							errorHTML.push({'id':node.htmlFor,'element':node,'html':node.outerHTML});
						}
						else
						{
							labelHTML.push({'id':node.htmlFor,'element':node,'html':node.outerHTML});						
						}
					}
					else
					{
						if (node.getAttribute("type") == "hint")
						{
							hintHTML.push({'id':node.getAttribute('for'),'element':node,'html':Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node))});
						}
						else if (node.getAttribute("type") == "error")
						{
							errorHTML.push({'id':node.getAttribute('for'),'element':node,'html':Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node))});
						}
						else
						{
							labelHTML.push({'id':node.getAttribute('for'),'element':node,'html':Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node))});						
						}
					}
					break;
				}
				case 'button':
				{
					if (Appcelerator.Browser.isIE)
					{
						buttonHTML.push(node.outerHTML);
					}
					else
					{
						buttonHTML.push(Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node)));	
					}
					break;
				}
			}
		}	
	}
	// 
	// horizontal: hint (top, right, bottom, input), error (top, right, bottom)
	// vertical: hint (top, right, bottom, input), error (top, right, bottom)
	// 
	for (var x=0;x<inputHTML.length;x++)
	{
		(function()
		{
			var label = '';
			var error = ''
			var hint = '';
			var input = '';
			input = inputHTML[x].element;

			// define label for this input
			label = '';
			for (var i=0;i<labelHTML.length;i++)
			{
				if (labelHTML[i].id == input.id)
				{
					label = labelHTML[i].html;
					break;
				}
			}

			// define error for this input
			error = ''
			for (var i=0;i<errorHTML.length;i++)
			{
				if (errorHTML[i].id == input.id)
				{
					error = errorHTML[i].html;
					break;
				}
			}

			// define hint for this input
			hint = '';
			for (var i=0;i<hintHTML.length;i++)
			{
				if (hintHTML[i].id == input.id)
				{
					hint = (hintPos == 'input')?hintHTML[i].element.innerHTML:hintHTML[i].html;
					break;
				}
			}

			if (align=='horizontal')
			{
				var valign = 'middle';
				var labelPadding = "5px";
				var inputPadding = "5px";
				var topPadding = "0px";
				if ((errorPos == 'top' || errorPos == 'bottom')&&((hintPos == 'top' || hintPos == 'bottom')))
				{
					valign = "middle";				
					labelPadding = "15px"
				}
				
				else if (errorPos == 'top' || hintPos == 'top')
				{
					valign = "bottom";
				}
				else if (errorPos=='bottom' || hintPos=='bottom')
				{
					valign = "top";
					topPadding = "4px"
				}
				// create form
				if ((labelPadding == "5px")  && (hintPos != 'bottom') && (errorPos != 'bottom'))
				{
					labelPadding = "9px";
				}
				
				html += '<tr><td align="left" valign="'+valign+'" width="'+labelWidth+'" style="padding-bottom:'+labelPadding+';padding-top:'+topPadding+'" >' + label + '</td>';
				html += '<td align="left" style="padding-bottom:'+inputPadding+'">';
				html += (hintPos == "top")?'<div>'+hint+'</div>':'';
				html += (errorPos == "top")?'<div>'+error+'</div>':'';
				html += Appcelerator.Util.Dom.toXML(input,true,Appcelerator.Compiler.getTagname(input));
				html += (hintPos == "right")?'<span style="padding-left:5px">'+hint+'</span>':'';
				html += (errorPos == "right")?'<span style="padding-left:5px">'+error+'</span>':'';
				html += (hintPos == 'bottom')?'<div style="margin-bottom:10px;position:relative;top:-1px">'+hint + '</div>':'';				
				html += (errorPos == 'bottom')?'<div style="margin-bottom:10px;position:relative;top:-1px">'+error + '</div>':'';
				html += '</td></tr>';
			}
			else
			{
				// create form
				html += '<tr><td align="left">' + label;
				html += (hintPos == "top")?'<span style="padding-left:5px">'+hint+'</span>':'';
				html += (errorPos == "top")?'<span style="padding-left:5px">'+error+'</span>':'';
				html += '</td></tr><tr>';
				html += (errorPos != 'bottom' && hintPos != 'bottom')?'<td align="left" style="padding-bottom:5px">':'<td align="left">';
				html += Appcelerator.Util.Dom.toXML(input,true,Appcelerator.Compiler.getTagname(input));
				html += (hintPos == "right")?'<span style="padding-left:5px">'+hint+'</span>':'';
				html += (errorPos == "right")?'<span style="padding-left:5px">'+error+'</span>':'';
				html += (hintPos == 'bottom')?'<div style="margin-bottom:5px;position:relative;top:-1px">'+hint + '</div>':'';				
				html += (errorPos == 'bottom')?'<div style="margin-bottom:5px;position:relative;top:-1px">'+error + '</div>':'';
				html += '</td></tr>';

			}
			if (options['hintPos'] == "input")
			{
				formElement.observe('element:compiled:'+formElement.id,function(a)
				{
					if (hintPos == "input")
					{
						$(input.id).value = hint;
						Element.addClassName($(input.id),'layout_form_hinttext');
					}

					Event.observe(input.id,'click',function(e)
					{
						if ($(input.id).value == hint)
						{
							$(input.id).value = '';
							Element.removeClassName($(input.id),'layout_form_hinttext');
						}
					});
					Event.observe(input.id,'blur',function(e)
					{
						if ($(input.id).value == '')
						{
							$(input.id).value = hint;
							Element.addClassName($(input.id),'layout_form_hinttext');

						}
					});
				});
			}
		})();
	}
	if (buttonHTML.length > 0)
	{
		var buttonPadding = (errorPos == 'bottom' || hintPos == 'bottom')?"0px":"5px";
		var paddingBottom = "5px";
		if (buttonPos == "right")
		{
			html += '<tr><td></td><td align="left" colspan="1" style="padding-top:'+buttonPadding+';padding-bottom:'+paddingBottom+'">';
		}
		else
		{
			html += '<tr><td align="left" colspan='+colspan+' style="padding-top:'+buttonPadding+';padding-bottom:'+paddingBottom+'">';		
		}
		for (var y=0;y<buttonHTML.length;y++)
		{
			html += buttonHTML[y] + '<span style="padding-right:10px"></span>';
		}
		html += '</td></tr>';
		
	}
	html +="</table>";
	return html;
};
