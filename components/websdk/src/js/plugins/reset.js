$.each(['clear','reset'],function()
{
	App.regAction(evtRegex(this),function(params,name,data)
	{
		var target = getTarget(params,this);
		var element = target.get(0);
		var tag = App.getTagname(element).toLowerCase();
		var revalidate = false;

		switch (tag)
		{
			case 'input':
			case 'textarea':
			{
			    target.val('');
				revalidate=true;
				break;
			}
			case 'select':
			{
			    element.selectedIndex = 0;
				revalidate=true;
				break;
			}
			case 'img':
			{
			    target.attr('src','');
				break;
			}
			case 'a':
			{
			    target.attr('href','#');
				break;
			}
			case 'form':
			{
				element.reset();
				$.each(target.find(":input"),function()
				{
					$(this).revalidate();
				});
	            break;
			}
			default:
			{
				target.text('');
				break;
			}
		}

		if (revalidate)
		{
		    target.revalidate();
		}
		
		return this;		
	});
});

