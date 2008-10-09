$.each(['clear','reset','clearform'],function()
{
	App.regAction(evtRegex(this),function(params,name,data)
	{
		var target = getTarget(params,this);
		var element = target.get(0);
		var tag = App.getTagname(element);

		switch (tag)
		{
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
				target.value('');
				break;
			}
		}		
		return this;		
	});
});

