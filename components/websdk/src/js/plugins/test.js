
var testCases = [];
var testPassed = 0;
var testFailed = 0;
var testErrored = 0;
var testListener = null;

$.fn.assert = function(expr)
{
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

$.fn.assertEnabled = function()
{
	var passed = true;
	$.each(this,function()
	{
		var v = $(this).attr('disabled');
		if (v)
		{
			passed=false;
			return false;
		}
	});
	return this.assert(passed);
};

$.fn.assertDisabled = function()
{
	var passed = true;
	$.each(this,function()
	{
		var v = $(this).attr('disabled');
		if (!v)
		{
			passed=false;
			return false;
		}
	});
	return this.assert(passed);
};

$.fn.assertCSS = function(key,val)
{
	var passed = true;
	$.each(this,function()
	{
		var v = $(this).css(key);
		if (v!=val)
		{
			passed=false;
			return false;
		}
	});
	return this.assert(passed);
};

$.fn.assertValid = function()
{
	var passed = true;
	$.each(this,function()
	{
		var v = $(this).data('validatorResult');
		if (!v)
		{
			passed=false;
			return false;
		}
	});
	return this.assert(passed);
};

$.fn.assertInvalid = function()
{
	var passed = true;
	$.each(this,function()
	{
		var v = $(this).data('validatorResult');
		if (v)
		{
			passed=false;
			return false;
		}
	});
	return this.assert(passed);
};

var oldPub = App.pubQueue;
var lastPubType = null, lastPubData = null;

// re-define to allow us to remember the last message and data payload
// for a publish so we can assert against it
App.pubQueue = function(name,data,local,scope,version)
{
	lastPubType = (local ? 'local' : 'remote') + ':' + name;
	lastPubData = data;
	return oldPub.apply(this,arguments);
};

$.fn.assertPub = function(name,data)
{
	name = App.normalizePub(name);
	if (typeof(data)=='undefined')
	{
		return this.assert(lastPubType === name);
	}
	if (name!==lastPubType)
	{
		return this.assert(name===lastPubType);
	}
	if (!lastPubData)
	{
		return this.assert(false);
	}
	for (var key in data)
	{
		var v1 = lastPubData[key];
		var v2 = data[key];
		if (v1!==v2)
		{
			return this.assert(false);
		}
	}
	return this.assert(true);
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

