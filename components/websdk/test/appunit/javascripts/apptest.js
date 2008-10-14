var suites;

(function($)
{
	$(document).on('compiled',function()
	{
		$.getJSON(AppC.docRoot+'tests.js',function(data)
		{
			var select = $("#suites").get(0);
			suites = data.suites;
			$.each(data.suites,function()
			{
				select[select.length]=new Option(this.script);
			});
		});
	});	

	$(document).sub('l:run',function(data)
	{
		if (typeof(data.tests) != Array)
		{
			data.tests = [data.tests]
		}
		$.each(data.tests,function()
		{
			var currentScript = this;
			var html = null;
			$.get(AppC.docRoot+this,function(js)
			{
				$.each(suites,function()
				{
					if (this.script == currentScript)
					{
						html = this.html;
						return;
					}
				})
				var loaded = false;
				
				function processTests()
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
							var msg = !result.passed ? result.message : '';
							$("#results").append("<div>passed: <span class='"+cls+"'>"+result.passed+"</span><div>"+msg+"</div></div>")
						}
					});
					
				}
				
				$('#test_html').empty();

				if (html != null)
				{
					$('#test_html').load(AppC.docRoot+html, function()
					{
						var state = App.createState($('#test_html'))
						$('#test_html').compileChildren(state);
						App.checkState(state,$('#test_html'))
						processTests();
					});
				}
				else
				{
					processTests()
				}
				
				
			},'text');
		});
	});

})(jQuery);


