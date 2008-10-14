

test.begin();
var ts = new Date;
$(document).after("1s",function()
{
	var time = new Date().getTime() - ts;
	var expect = 1000 * .95; // timing in browser isn't absolute and sometimes is slightly faster
	test.assert("delay wasn't correct, was: "+time+" ms, expected: >="+expect+" ms", time >= expect);
	test.assert('document was not on scope',this.get(0)==document);
	test.end();
});

test.begin();
var ts2 = new Date;
$(document).after(100,function()
{
	var time = new Date().getTime() - ts2;
	var expect = 100 * .95;
	test.assert("delay wasn't correct, was: "+time+" ms, expected: >="+expect+" ms", time >= expect);
	test.end();
});

test.begin();
var ts3 = new Date;
$(document).after('100ms',function()
{
	var time = new Date().getTime() - ts3;
	var expect = 100 * .95;
	test.assert("delay wasn't correct, was: "+time+" ms, expected: >="+expect+" ms", time >= expect);
	test.end();
});






