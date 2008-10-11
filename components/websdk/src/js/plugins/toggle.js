$.fn.toggle = function(params)
{
	params = convertParams(params);
	$.each(this,function()
	{
		var target = $(this);
		for (var p in params)
		{
			switch(p)
			{
				case 'id':
				case 'event':
				{
					break;
				}
				// toggle CSS class
				case 'className':
				case 'class':
				{
					target.toggleClass(params[p])
					break;				
				}
				default:
				{
					// toggle CSS property
					if (cssProperties.indexOf(p)!=-1 || cssProperties.indexOf($.camel(p))!=-1)
					{
						var currentVal = target.css(p)
						var opposites = {'inline':'none', 'block':'none','none':'block','hidden':'visible','visible':'hidden'};					
						var opposite = opposites[currentVal] || '';
						if (currentVal == params[p])
						{
							target.css(p,opposite);	
							break;					
						}
						else
						{
							target.css(p,params[p])
							break;
						}

					}
					// toggle element attribute
					else
					{
						if (target.attr(p))
						{
							target.removeAttr(p)
							break;
						}
						else
						{
							target.attr(p,params[p]);
							break;
						}
					}

				}
			}
		}
	});
	return this;
};
