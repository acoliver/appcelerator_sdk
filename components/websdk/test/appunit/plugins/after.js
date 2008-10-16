
// timing in browser isn't absolute and sometimes is slightly faster - set a variance percent that's allowable

testAsync("this is a test",function()
{
	$(document).after("1s",function()
	{
		var time = new Date().getTime() - ts;
		test.assert("delay wasn't correct, was: "+time+" ms, expected > 800ms", time > 800);
		test.assert('document was not on scope',this.get(0)==document);
		end();
	});
},100)


test.begin(function()
{
	$(document).after("1s",function()
	{
		var time = new Date().getTime() - ts;
		test.assert("delay wasn't correct, was: "+time+" ms, expected > 800ms", time > 800);
		test.assert('document was not on scope',this.get(0)==document);
		test.end();
	});
});

var ts = new Date;
$(document).after("1s",function()
{
	var time = new Date().getTime() - ts;
	test.assert("delay wasn't correct, was: "+time+" ms, expected > 800ms", time > 800);
	test.assert('document was not on scope',this.get(0)==document);
	test.end();
});

test.begin();
var ts2 = new Date;
$(document).after(200,function()
{
	var time = new Date().getTime() - ts3;
	test.assert("delay wasn't correct, was: "+time+" ms, expected > 100ms", time > 100);
	test.end();
});

test.begin();
var ts3 = new Date;
$(document).after('200ms',function()
{
	var time = new Date().getTime() - ts3;
	test.assert("delay wasn't correct, was: "+time+" ms, expected > 100ms", time > 100);
	test.end();
});






