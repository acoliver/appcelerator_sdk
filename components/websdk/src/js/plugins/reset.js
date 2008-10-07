$.each(['clear','reset'],function()
{
	App.regAction(evtRegex(this),function(params,name,data)
	{
		var target = getTarget(params,this);
		var element = target.get(0);
		var tag = App.getTagname(element);
		var revalidate = false;

		switch (tag)
		{
			case 'input':
			case 'textarea':
			{
			    target.val('');
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
				target.find(":input").revalidate();
	            break;
			}
			default:
			{
				target.text('');
				revalidate = true;
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

