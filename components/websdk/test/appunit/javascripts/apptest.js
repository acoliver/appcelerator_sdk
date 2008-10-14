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
		if (data.all)
		{
			data.tests = [];
			$.each($("#suites").children(),function()
			{
				data.tests.push(this.value);
			});
		}
		else
		{
			data.tests = [data.tests];
		}

		$("#results").empty();
		$('#test_html').empty();
		
		var currentTest = 0;
		
		function runNextTest()
		{
			if (currentTest >= data.tests.length)
			{
				return;
			}
			var currentScript = data.tests[currentTest];
			var html = null;
			var timeout = null;
			currentTest++;
			$.get(AppC.docRoot+currentScript,function(js)
			{
				$.each(suites,function()
				{
					if (this.script == currentScript)
					{
						html = this.html;
						timeout = this.timeout;
						return false;
					}
				})
				
				timeout = App.timeFormat(timeout||'10s');
				var loaded = false;
				
				function processTests()
				{
					AppC.runTests(timeout,function(test)
					{
						$("#results").append("<div>Starting test... "+currentScript+"</div>");
						eval(js)
					},
					function(result)
					{
						$("#results").append("<div>Finished! "+result.passed+" passed, "+result.failed+" failed, "+result.errored+" errored</div>");
						if (data.tests.length > 1) $("#results").append("<hr/>");
						runNextTest();
					},
					{
						result: function(result)
						{
							var cls = result.passed ? 'passed' : result.errored ? 'errored' : 'failed';
							var msg = !result.passed ? result.message : '';
							$("#results").append("<div>passed: <span class='"+cls+"'>"+result.passed+"</span><div>"+msg+"</div></div>")
						}
					});
				}
				
				if (data.tests.length==1) $("#results").empty();
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
		}
		
		runNextTest();
	});

})(jQuery);


