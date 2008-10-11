
var testCases = [];
var testPassed = 0;
var testFailed = 0;
var testErrored = 0;
var testListener = null;

$.fn.assert = function(expr)
{
	$.info("assert = "+expr);
	var passed = true, error = null, stop = false;
	if (typeof(expr)=='boolean')
	{
		passed = expr;
		stop = true;
	}
	else if (typeof(expr)=='string')
	{
		expr = $.toFunction(expr);
	}
	if (!stop)
	{
		$.each(this,function()
		{
			try
			{
				var result = expr.call($(this));
				if (result!==true)
				{
					passed = false;
					return false;
				}
			}
			catch(E)
			{
				passed=false;
				error = E;
				return false;
			}
		});
	}
	var result = {
		passed: passed,
		expr: String(expr),
		error: error
	};
	testCases.push(result);
	if (passed) testPassed++;
	if (error) testErrored++;
	if (!passed && !error) testFailed++;
	if (testListener) testListener.result(result);
	return this;
};


var TestGuard = function(fn,cb)
{
	this.count = 0;
	this.begin = function()
	{
		if (cb && cb.begin) cb.begin(this.count);
		return this.count++;
	}
	this.end = function()
	{
		if (cb && cb.end) cb.end(this.count-1);
		if (--this.count == 0)
		{
			fn();
		}
	}
	this.assert = function(expr)
	{
		return $(document).assert(expr);
	}
};

AppC.runTests = function(begin,end,cb)
{
	testCases = [];
	testPassed = 0;
	testFailed = 0;
	testErrored = 0;
	testListener = cb;
	var complete = function()
	{
		if (end)
		{
			end({
				passed: testPassed,
				failed: testFailed,
				errored: testErrored,
				tests: testCases
			});
		}
		else
		{
			var count = testPassed + testFailed + testErrored;
			var msg = 'TEST RESULTS: ' + count + ' test' + (count > 1 ? 's' : '') + ' executed: ';
			if (testFailed > 0 || testErrored > 0)
			{
				var r = [];
				if (testFailed) r.push(testFailed+' failed');
				if (testErrored)
				{
					r.push(testErrored+' errored');
				}
				r.push(testPassed+' passed');
				msg+=r.join(', ');
			}
			else
			{
				msg+='All Passed! Now go take a nice break.';
			}
			$.info(msg);
			if (testFailed || testErrored)
			{
				$.each(testCases,function()
				{
					if (this.error)
					{
						$.error("ERROR: "+this.error+", test: "+this.expr);
					}
					else
					{
						$.error("FAILED: "+this.expr);
					}
				});
			}
		}
	};
	var guard = new TestGuard(complete,cb);
	guard.begin();
	begin(guard);
	guard.end();
};

