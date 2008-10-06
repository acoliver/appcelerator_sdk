
var cssProperties = [
	'border', 'padding', 'margin', 'color', 'cursor', 'font', 'fontFamily', 'visibility', 'position', 'overflow', 'filter', 'display', 
	'backgroundColor', 'backgroundPosition', 'backgroundAttachment', 'borderBottomColor', 'borderBottomStyle', 
	'borderBottomWidth', 'borderLeftColor', 'borderLeftStyle', 'borderLeftWidth',
	'borderRightColor', 'borderRightStyle', 'borderRightWidth', 'borderSpacing',
	'borderTopColor', 'borderTopStyle', 'borderTopWidth', 'bottom', 'clip', 'color',
	'fontSize', 'fontWeight', 'height', 'left', 'letterSpacing', 'lineHeight',
	'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'markerOffset', 'maxHeight',
	'maxWidth', 'minHeight', 'minWidth', 'opacity', 'outlineColor', 'outlineOffset',
	'outlineWidth', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop',
	'right', 'textIndent', 'top', 'width', 'wordSpacing', 'zIndex'];

//
// create a plugin/action for set
//
App.regAction(evtRegex('set'),function(params)
{
	var target = getTarget(params,this);
	var el = target.get(0);
	var tag = getTagname(el);
	
	for (var p in params)
	{
		switch(p)
		{
			case 'id':
			case 'event':
			{
				break;
			}
			case 'class':
			case 'className':
			{
				target.attr('class',params[p]);
				break;
			}
			case 'style':
			{
				//ex: set[style=foo:bar;]
				$.each(params[p].split(';'),function()
				{
					var t = this.split(':');
					if (t && t.length > 1)
					{
						target.css(t[0],t[1]);
						return;
					}
				});
				break;
			}
			case 'href':
			{
				switch(tag)
				{
					case 'a':
					case 'link':
					{
						target.attr('href',URI.absolutizeURI(params[p],AppC.docRoot));
						break;
					}
				}
			}
			case 'src':
			{
				switch(tag)
				{
					case 'iframe':
					case 'script':
					case 'image':
					{
						var onload = target.attr('onloaded');
					    if (onload)
					    {
							var done = false;
							el.onload = el.onreadystatechange = function()
							{
								if ( !done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete"))
								{
									done = true;
									target.pub(onload,{source:{id:el.id}},target.attr('scope'));
									el.onload = null;
								}
							}
				        }
						if (AppC.UA.opera)
						{
    				        el.location.href = URI.absolutizeURI(params[p],AppC.docRoot);
						}
						else
						{
							el.src = URI.absolutizeURI(params[p],AppC.docRoot);
						}
						break;
					}
					default:
					{
						target.attr(p,params[p]);
						break;
					}
				}
				break;
			}

			default:
			{
				// check to see if a css property
				if (cssProperties.indexOf(p)!=-1 || cssProperties.indexOf($.camel(p))!=-1)
				{
					target.css(p,params[p]);
				}
				// set it as an attribute
				else
				{
					target.attr(p,params[p]);
				}
			}
		}
	}
	return this;
});

