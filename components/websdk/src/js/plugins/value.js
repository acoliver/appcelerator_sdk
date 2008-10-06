App.regAction(evtRegex('value'),function(params,name,data)
{
	//$.info('params='+$.toJSON(params)+', data='+$.toJSON(data));
	
	var target = getTarget(params,this);
	var el = target.get(0);
	var tag = App.getTagname(el);
	var value = $.getNestedProperty(params,data,data);

	switch(tag)
	{
		//FIXME - others
		case 'input':
		{
			el.value = value;
			break;
		}
		default:
		{
			target.html(value);
			break;
		}
	}
},true);

