Appcelerator.Compiler.registerCustomAction('history',
{
	build: function(id,action,params)
	{
		if (params && params.length > 0)
		{
			var obj = params[0];
			var key = obj.key;
			return 'Appcelerator.History.go("'+key+'");';
		}
		else
		{
			throw "required parameter for history action";
		}	
	}
});
