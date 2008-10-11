(function($)
{
	$(document).on('compiled',function()
	{
		$.getJSON(AppC.docRoot+'tests.js',function(data)
		{
			var select = $("#suites").get(0);
			$.each(data.suites,function()
			{
				select[select.length]=new Option(this);
			});
		});
	});	

	$(document).sub('l:run',function(data)
	{
		$.each(data.tests,function()
		{
			$.get(AppC.docRoot+this,function(js)
			{
				AppC.runTests(function(test)
				{
					eval(js)
				},
				function(result)
				{
					$.info('finished '+result.passed)
				},
				{
					result: function(result)
					{
						$.info('result = '+result.passed);
						var cls = result.passed ? 'passed' : result.errored ? 'errored' : 'failed';
						var msg = !result.passed ? result.expr : '';
						$("#results").append("<div>passed: <span class='"+cls+"'>"+result.passed+"</span><div>"+msg+"</div></div>")
					}
				});
				
			},'text');
		});
	});

})(jQuery);


