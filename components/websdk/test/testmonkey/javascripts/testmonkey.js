/*!(c) 2006-2008 Appcelerator, Inc. http://appcelerator.org
 * Licensed under the Apache License, Version 2.0. Please visit
 * http://license.appcelerator.com for full copy of the License.
 **/
window.TestMonkey = {};

(function(scope,$){

	var testRunnerPlugin = null;
	
	function fireEvent()
	{
		if (testRunnerPlugin)
		{
			var name = arguments[0], args = arguments.length > 1 ? $.makeArray(arguments).slice(1) : [];
			var fn = testRunnerPlugin[name];
			if (fn)
			{
				fn.apply(testRunnerPlugin,args);
			}
			// support a catch-all event handler
			fn = testRunnerPlugin['onEvent'];
			if (fn)
			{
				args.unshift(name);
				fn.apply(testRunnerPlugin,args);
			}
		}
	}

	var assertions = {};
	var currentDescriptor = null, currentSuite = null;
	
	TestMonkey.installTestRunnerPlugin = function(callback)
	{
		testRunnerPlugin = callback;
	};
	
	TestMonkey.installAssertionType = function(name,handler)
	{
		assertions[name]=handler;
	};
	
	scope.testRunner = function()
	{
		// cleanup in case we call this multiple times
		currentDescriptor = currentSuite = currentTestCase = null;
		testCases = [];
		
		var suites = [];
		var it = typeof(arguments[0].push)=='function' ? arguments[0] : arguments;
		$.each(it,function()
		{
			var descriptor = testSuites[this];
			if (descriptor)
			{
				suites.push([this,descriptor]);
			}
		});

		fireEvent('beforeTestRunner',suites);
		
		
		// we first have to run through them so all the tests can be recorded
		// they won't run at this point
		$.each(suites,function()
		{
			var descriptor = currentDescriptor = this[1];
			var name = currentSuite = this[0];
			var error = false;
			try
			{
				descriptor.run();
			}
			catch(E)
			{
				error = E;
			}
			currentDescriptor = null;
		});

		// set it to the first one in the list
		currentSuite = null;
		if (currentSuite) fireEvent('beforeTestSuite',suites[0][0]);

		fireEvent('beforeTestCases',testCases);

		fireEvent('beforeAssertionCount',assertCount);
		var assertCount = 0;
		
		$.each(testCases,function()
		{
			var testcase = this;
			assertCount += testcase.asserts.length;
			testcase.running = false;
			testcase.ready = true;
		});
		
		fireEvent('afterAssertionCount',assertCount);
		
		var total = 0, loaded = 0;

		// we need to load any pending HTML for the test
		// and then wait until they're all complete before we 
		// start running the test cases
		$.each(suites,function()
		{
			var descriptor = this[1];
			var html = descriptor.html;
			if (html)
			{
				total+=1;
				loadTestFrame(html,function(id)
				{
					// mark the id for the frame onto the descriptor
					descriptor.htmlID = id;
					loaded+=1;
					if (loaded == total)
					{
						executeNextTestCase();
					}
				});
			}
			else
			{
				descriptor.htmlID = String(Math.round( Math.random() * 10000 ));
			}
		});

		if (total==0)
		{
			executeNextTestCase();
		}
	}
	
	function executeNextTestCase()
	{
		var nextTestCase = null;
		$.each(testCases,function()
		{
			if (this.ready)
			{
				nextTestCase = this;
				return false;
			}
		});
		
		if (nextTestCase)
		{
			if (currentSuite!=nextTestCase.suite)
			{
				if (currentSuite)
				{
					fireEvent('afterTestSuite',currentSuite);
					var currentD = testSuites[currentSuite];
					if (currentD.htmlID) removeTestFrame(currentD.htmlID);
				}
				currentSuite = nextTestCase.suite;
				fireEvent('beforeTestSuite',currentSuite);
			}
			nextTestCase.ready = false;
			var testcase = nextTestCase;
			fireEvent('beforeTestCase',testcase);
			var descriptor = testcase.descriptor;
			var error = false;
			try
			{
				executeTest(testcase,descriptor);
			}
			catch(E)
			{
				error = E;
				testcase.running = false;
				testcase.error = E;
				testcase.message = "Exception running testcase: "+E;
			}
		}
		else
		{
			if (currentSuite)
			{
				fireEvent('afterTestSuite',currentSuite);
				var currentD = testSuites[currentSuite];
				if (currentD.htmlID) removeTestFrame(currentD.htmlID);
			}
			fireEvent('afterTestCases',testCases);
			fireEvent('afterTestRunner');
		}
	}

	function runAssertion(value)
	{
		switch(typeof(value))
		{
			case 'boolean':
				return [value===true,value];
			case 'function':
				value = $.toFunction('(' + String(value) + ')()')();
				return [(value ? true : false), value];
			default:
				return [(value ? true : false), value];
		}
	}
	
	TestMonkey.installAssertionType('',function(testcase,assertion,args)
	{
		return runAssertion(args[0]);
	});
	
	TestMonkey.installAssertionType('Visible',function(testcase,assertion,args)
	{
		return [this.css('visibility')=='visible',this.css('visibility')];
	});

	TestMonkey.installAssertionType('Hidden',function(testcase,assertion,args)
	{
		return [this.css('visibility')=='hidden',this.css('visibility')];
	});

	TestMonkey.installAssertionType('Disabled',function(testcase,assertion,args)
	{
		return [this.attr('disabled'),this.attr('disabled')];
	});

	TestMonkey.installAssertionType('Enabled',function(testcase,assertion,args)
	{
		return [!this.attr('disabled'),this.attr('disabled')];
	});

	TestMonkey.installAssertionType('CSS',function(testcase,assertion,args)
	{
		return [this.css(args[0]) == args[1],this.css(args[0])];
	});

	TestMonkey.installAssertionType('Attr',function(testcase,assertion,args)
	{
		return [String(this.attr(args[0])) == String(args[1]),String(this.attr(args[0]))];
	});

	TestMonkey.installAssertionType('Class',function(testcase,assertion,args)
	{
		return [this.hasClass(args[0]),this.attr('class')];
	});
	
	TestMonkey.installAssertionType('HTML',function(testcase,assertion,args)
	{
		return [this.html()==args[0],this.html()];
	});

	TestMonkey.installAssertionType('Value',function(testcase,assertion,args)
	{
		return [this.val()==args[0],this.val()];
	});

	TestMonkey.installAssertionType('Text',function(testcase,assertion,args)
	{
		return [this.text()==args[0],this.text()];
	});

	TestMonkey.installAssertionType('Empty',function(testcase,assertion,args)
	{
		return [this.text()=='',this.text()];
	});

	TestMonkey.installAssertionType('Checked',function(testcase,assertion,args)
	{
		return [this.get(0).checked,this.get(0).checked];
	});

	TestMonkey.installAssertionType('Unchecked',function(testcase,assertion,args)
	{
		return [!this.get(0).checked,this.get(0).checked];
	});
	
	function internalAssert()
	{
		var idx = arguments[0], type = arguments[1]||'';
		var args = $.makeArray(arguments).splice(2);
		var result = false;
		var testcase = currentTestCase;
		var assert = testcase.asserts[idx];
		try
		{
			var handler = assertions[type];
			if (handler)
			{
				result = handler.apply(this,[testcase,assert,args]);
			}
			var message = result[0] ? null : 'value was "' + result[1] + '" (' + typeof(result[1]) + ')';
			testcase.results.push({assert:assert,result:result[0],message:message,idx:idx});
		}
		catch (E)
		{
			testcase.results.push({assert:assert,result:false,error:E,message:String(E),idx:idx});
		}
	}
	
	var currentTestCase = null;
	
	$.fn.assertTestCase = function()
	{
		internalAssert.apply(this,arguments);
		return this;
	};
	
	function executeTest(testcase,descriptor)
	{
		testcase.results = [];
		testcase.running = true;
		currentTestCase = testcase;
		var timer = null;
		var frame_doc = null;
		window.testScope = function()
		{
			var self = this;
			this.jQuery = window.jQuery;
			this.descriptor = descriptor;
			this.internalAssert = internalAssert;
			this.$ = function(selector)
			{
				var result = jQuery("#"+descriptor.htmlID).contents().find(selector);
				result.assertTestCase = function()
				{
					if (testcase.running)
					{
						return internalAssert.apply(this,arguments);
					}
					return false;
				};
				return result;				
			}
			this.setup = function()
			{
				if (descriptor.setup) try { descriptor.setup(); } catch (E) {}
			}
			this.teardown = function()
			{
				if (descriptor.teardown) try { descriptor.teardown(); } catch (E) {}
			}
			this.assertTestCase=function()
			{
				if (testcase.running)
				{
					return internalAssert.apply(this,arguments);
				}
				return false;
			}
			this.log=function(msg)
			{
				if (!testcase.logs)
				{
					testcase.logs = [];
				}
				testcase.logs.push(msg);
			}
			this.error = function(E)
			{
				testcase.failed = true;
				testcase.error = E;
				testcase.message = "Exception running testcase: "+E;
				testcase.results.push({'result':false,'error':E,'message':testcase.message});
				self.end(true,false);
			}
			this.fail=function(msg)
			{
				testcase.message = msg;
				testcase.explicitFailure = true;
				testcase.results.push({'result':false,'message':testcase.message});
				self.end(true,false);
			}
			this.end=function(failed,timeout)
			{
				this.$('#'+descriptor.htmlID+'__testmonkey_magic').remove();
				testcase.after_dom = '<html>\n'+frame_doc.html()+'\n</html>';
				if (!testcase.running) return;
				if (timer)
				{
					clearTimeout(timer);
					timer=null;
				}
				testcase.running = false;
				if (failed)
				{
					testcase.failed = true;
				}
				else
				{
					var passed = true;
					jQuery.each(testcase.results,function()
					{
						if (!this.result)
						{
							passed=false;
							return false;
						}
					});
					testcase.failed = !passed;
					if (passed && !testcase.message) testcase.message ="Assertions Passed";
					if (!passed && !testcase.message) testcase.message = "Assertion Failures";
				}
				if (timeout)
				{
					testcase.timeout = true;
					testcase.message = "Timed out";
					testcase.results.push({'result':false,'message':testcase.message});
				}
				fireEvent('afterTestCase',testcase,descriptor);
				executeNextTestCase();
			}
		}
		var t = new window.testScope;
		try
		{
			
			var code="var scope = parent ? new parent.window.testScope : window.testScope;\n";
			code+="var jq = typeof(jQuery)=='undefined' ? scope.$ : jQuery;\n";
			code+="try {\n";
			code+= "(function($){\n";
			code+="function log() { return scope.log.apply(this,arguments) }\n";
			code+="function end() { return scope.end.apply(this,arguments) }\n";
			code+="function fail() { return scope.fail.apply(this,arguments) }\n";
			code+="function error() { return scope.error.apply(this,arguments) }\n";
			code+="function assertTestCase() { return scope.assertTestCase.apply(this,arguments) }\n";
			code+="scope.setup.call(scope.descriptor);\n";
			code+='('+testcase.code+').call(scope.descriptor);\n';
			code+='\n})(jq);\n';
			code+="}catch(E){\n";
			code+="scope.error(E);\n";
			code+="}\n";
			code+="scope.teardown.call(scope.descriptor);\n";
			
			var body = jQuery("#"+descriptor.htmlID).contents().find("body").get(0);

			if (!body)
			{
				// in this case, they didn't load up any iframe - we need to dynamically create one (for test cases that don't specify html)
				jQuery("<iframe style='position:absolute;left:-10px;top:-10px;height:1px;width:1px;' id='" + descriptor.htmlID+"'></iframe>").appendTo("body");
				body = jQuery("#"+descriptor.htmlID).contents().find("body").get(0);
			}
			
			frame_doc = jQuery(body.parentNode);
			testcase.before_dom = '<html>\n'+frame_doc.html()+'\n</html>';
			
			var script = body.ownerDocument.createElement('script');
			script.type = "text/javascript";
			script.id = descriptor.htmlID+'__testmonkey_magic';
			if ( jQuery.browser.msie )
			{
				script.text = code;
			}
			else
			{
				script.appendChild( body.ownerDocument.createTextNode( code ) );
			}

			body.appendChild(script);
			
			if (typeof(testcase.timeout)=='undefined')
			{
				t.end(false,false);
			}
			else
			{
				timer=setTimeout(function(){t.end(true,true)},testcase.timeout);
			}
		}
		catch(E)
		{
			testcase.failed = true;
			testcase.error = E;
			testcase.message = "Exception running testcase: "+E;
			testcase.results.push({'result':false,'error':E,'message':testcase.message});
			t.end(true,false);
		}
	}
	
	scope.extractCodeLine = function (code,expr)
	{
		var result = expr;
		var idx = code.indexOf(expr);
		if (idx!=-1)
		{
			var end = idx + expr.length;
			idx--;
			// back up to the beginning of the line
			while ( idx >= 0)
			{
				var ch = code.charAt(idx);
				if (ch == ';' || ch=='\n' || ch=='\r')
				{
					break;
				}
				result = ch + result;
				idx--;
			}
			// go to the end of the line
			while ( end < code.length )
			{
				var ch = code.charAt(end);
				result = result + ch;
				if (ch == ';' || ch=='\n' || ch=='\r')
				{
					break;
				}
				end++;
			}
		}
		return result;
	}
	
	var testFrameId = 1;
	
	function loadTestFrame(url,fn)
	{
		var id = '__testdriver_content_'+(testFrameId++);
		url = URI.absolutizeURI(url,AppC.docRoot+'tests/');
		$("<iframe id='"+id+"' src='"+url+"' frameborder='0' height='1' width='1' style='position:absolute;left:-100px;top:-10px;'></iframe>").appendTo("body");
		$('#'+id).load(function()
		{
			fn(id);
		});
	}
	
	function removeTestFrame(id)
	{
		// for this frame, we need to drop back to DOM instead of just .remove it seems
		var el = $("#"+id);
		// if (el.length > 0)
		// {
		// 	var node = el.get(0);
		// 	setTimeout(function()
		// 	{
		// 		node.parentNode.removeChild(node);
		// 	},10);
		// }
	}
	
	function escapeString(str)
	{
		return $.gsub(str,'"',"\\\"");
	}
	
	function preProcessCode(code)
	{
		var re = /assert(.*?)[\s]?\((.*)?\)/;
		var _asserts = [];
		var newcode = $.gsub(code,re,function(m)
		{
			_asserts.push(m[0]); 
			var prefix = m[1] ? '"' + escapeString(m[1]) + '"' : 'null';
			var params = m[2];
			return 'assertTestCase(' + (_asserts.length-1) + ','+prefix+','+params+')';
		});
		var asserts = [];
		$.each(_asserts,function()
		{
			asserts.push(extractCodeLine(code,this));
		});
		return { asserts: asserts,code: newcode }
	}
	
	var testCases = [];

	scope.testAsync = function()
	{
		var name = arguments[0], timeout = 1000, fn = null;
		if (arguments.length == 2) 
		{
			fn = arguments[1];
		}
		else
		{
			timeout = arguments[1];
			fn = arguments[2];
		}
		var results = preProcessCode(String(fn));
		testCases.push({
			name: name,
			code: results.code,
			testcase: String(fn),
			timeout: timeout,
			asserts: results.asserts,
			descriptor: currentDescriptor,
			suite:currentSuite
		});
	}
	
	scope.test = function()
	{
		var name = arguments[0], fn = arguments[1];
		var results = preProcessCode(String(fn));
		testCases.push({
			name: name,
			code: results.code,
			testcase: String(fn),
			asserts: results.asserts,
			descriptor: currentDescriptor,
			suite:currentSuite
		});
	};
	
	var testSuites = {};
	
	scope.testSuite = function(name,html,descriptor)
	{
		if (typeof(html)!='string')
		{
			descriptor = html;
			html = null;
		}
		
		descriptor.html=html;
		testSuites[name]=descriptor;
		
		fireEvent("addTestSuite",name,descriptor,html);
		
		this.run = function()
		{
			testRunner(name);
		}
		
		return this;
	}
	
})(window,jQuery);

