App.reg('srcexpr','img',function(params)
{	
	var value = null;
	for (var p in params)
	{
		switch(p)
		{
			case 'id':
			case 'event':
			{
				break;
			}
			default:
			{
				value = params[p];
				break;
			}
		}
	}
	getTarget(params,this).srcexpr(value);
});
