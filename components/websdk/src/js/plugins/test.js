
var testCases = [];
var testPassed = 0;
var testFailed = 0;
var testErrored = 0;
var testListener = null;

$.fn.assert = function()
{
	var passed = true, error = null, stop = false, message = String(arguments[0]), expr = arguments[0];
	if (typeof(arguments[0])=='string' && arguments.length==2 && typeof(arguments[1])!='undefined')
	{
		// first is a message explanation of test failure and 2nd is the assertion
		expr = arguments[1];
	}
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
		message: message,
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
$.fn.assertClass = function(className)
{
	var passed = true;
	$.each(this,function()
	{
		if ($(this).hasClass(className)==false)
		{
			passed=false;
			return false;
		}
	});
	return this.assert(passed)
};
$.fn.assertAttr = function(attr)
{
	var passed = true;
	$.each(this,function()
	{
		if (!$(this).attr(attr))
		{
			passed=false;
			return false;
		}
	});
	return this.assert(passed)
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
		return this.assert(name+" was not correct. expected: "+name+", was: "+lastPubType,lastPubType === name);
	}
	if (name!==lastPubType)
	{
		return this.assert(name+" was not correct. expected: "+name+", was: "+lastPubType,name===lastPubType);
	}
	if (!lastPubData)
	{
		return this.assert(name+" missing data payload: "+$.toJSON(data),false);
	}
	for (var key in data)
	{
		var v1 = lastPubData[key];
		var v2 = data[key];
		if (v1!==v2)
		{
			return this.assert(name+" has incorrect data payload entry for key: "+key+", expected: "+v2+", was: "+v1,false);
		}
	}
	return this.assert(name,true);
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
	this.assert = function(a,b)
	{
		return $(document).assert(a,b);
	}
	this.assertPub = function(name,data)
	{
		return $(document).assertPub(name,data);
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
						$.error("ERROR: "+this.error+", message: "+this.message);
					}
					else
					{
						$.error("FAILED: "+this.expr+", message: "+this.message);
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

