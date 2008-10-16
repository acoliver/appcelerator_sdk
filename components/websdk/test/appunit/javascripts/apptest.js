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
		var runAll = false;
		var passedTotal = 0;
		var failedTotal = 0;
		var errorTotal = 0;
		
		if (data.all)
		{
			runAll = true;
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

		$("#results_table").empty();
		$("#results_table").html('<caption style="padding:5px;border-top:1px solid #ccc;">Test Results Summary</caption><thead><td>Test Script</td><td>Passed</td><td>Failed</td><td>Errors</td></thead>')
		$('#test_html').empty();
		$('#passed').empty();
		$('#failed').empty();
		$('#errors').empty();
		
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
				var count = 1;
				function processTests()
				{
					AppC.runTests(timeout,function(test)
					{
					//	$("#results").append("<div class='suite_success' style='padding-bottom:5px;margin-top:10px;border-top:1px solid #ccc'>Running Test: "+currentScript+"</div>");
						eval(js)
					},
					function(result)
					{
						var errorClass = '';
						if (result.failed > 0 || result.errored > 0)errorClass = 'suite_error';
						if (runAll == true)
						{
							$('#error_count').html(errorTotal += result.errored);
							$('#passed_count').html(passedTotal += result.passed);
							$('#failed_count').html(failedTotal += result.failed);
						}
						else
						{
							$('#error_count').html(result.errored);
							$('#passed_count').html(result.passed);
							$('#failed_count').html(result.failed);							
						}
						
						//$("#results").append("<div style='border-bottom:1px solid #ccc' class='"+errorClass+"'>Results: "+result.passed+" passed, "+result.failed+" failed, "+result.errored+" errored</div>");
						$("#results_table").append("<tr><td class='"+errorClass+"'>"+currentScript+"</td><td class='"+errorClass+"' align='center'>"+result.passed+"</td><td class='"+errorClass+"' align='center'>"+result.failed+" </td><td class='"+errorClass+"' align='center'> "+result.errored+" </td></tr>");

						runNextTest();
					},
					{
						result: function(result)
						{
							var cls = result.passed ? 'passed' : result.errored ? 'errored' : 'failed';
							var msg = !result.passed ? result.message : '';
							if (msg) $("#failure_detail").append("<div class='error'>"+result.message+"</div>");
							if (cls=='passed')
							{
								if ($('#passed').css('visibility') == 'hidden')$('#passed').css('visibility','visible');
								$('#passed').append("<div class='passed_bar'><div>");
							}
							else if (cls=='failed')
							{
								if ($('#failed').css('visibility') == 'hidden')$('#failed').css('visibility','visible');
								$('#failed').append("<div class='failed_bar'><div>");							
							}
							else
							{
								if ($('#error').css('visibility') == 'hidden')$('#error').css('visibility','visible');								
								$('#error').append("<div class='error_bar'><div>");								
							}
							//$("#results").append("<div>passed: <span class='"+cls+"'>"+result.passed+"</span><div>"+msg+"</div></div>")
							$.info('count = ' + count);
							count++;	
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


