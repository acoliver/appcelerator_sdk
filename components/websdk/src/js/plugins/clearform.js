App.regAction(evtRegex('clearform'),function(params,name)
{
	var target = getTarget(params,this);
	var el = target.get(0);
	var tag = App.getTagname(el);
	
	switch(tag)
	{
		case 'form':
		{
			el.reset();
			break;
		}
		case 'input':
		case 'select':
		case 'textarea':
		case 'button':
		default:
		{
			el.form.reset();
			break;
		}
	}
	return this;
});
