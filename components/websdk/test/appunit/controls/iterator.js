

test.begin();
$('#iterator_test_1').control('iterator',function(params)
{
	test.assert('iterator instance was null',typeof(this.render)=='function');
	test.assert('iterator instance not returned correctly from control with no parameters',this===$('#iterator_test_1').control());
	test.end();
});


test.begin();
$('#iterator_test_2').control('iterator',{'items':[1,2,3]},function(params)
{
	test.assert("items was null",params.items!=null)
	test.assert("items params wasn't passed correctly, expected: 1, was: "+params.items[0],params.items[0]==1)
	test.end();
});


test.begin();
var rendered = false;
$('#iterator_test_2').control('iterator',{'items':[1,2,3],'template':'#{iterator_value}'},function()
{
	var bindFn = function()
	{
		if (!rendered)
		{
			rendered=true; // is called multiple times, we only want to record the first one
			var html = $("#iterator_test_2").html();
			test.assert("render didn't produce correct results, was: "+html+", expected: 123",html=='123');
			$("#iterator_test_2").unbind('rendered',bindFn);
			test.end();
		}
	};
	$("#iterator_test_2").bind('rendered',bindFn);
});


test.begin();
$("#iterator_test_3").bind('created',function(instance)
{
	test.assert('instance parameter was null',instance!=null);
	test.end();
});
$('#iterator_test_3').control('iterator');


// check our declarative ones
test.begin();
$("#iterator_test_4").after('1000ms',function()
{
	var html = $("#iterator_test_4").html();
	test.assert("error in #iterator_test_4, expected: 123, was: "+html,html=='123');
	var control = $("#iterator_test_4").control();
	test.assert("iterator control not returned for #iterator_test_4, was: "+control,control);
	test.end();
});

