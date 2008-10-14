
// timing in browser isn't absolute and sometimes is slightly faster - set a variance percent that's allowable
var variance = .90;

test.begin();
var ts = new Date;
$(document).after("1s",function()
{
	var time = new Date().getTime() - ts;
	var low = 1000 * variance, high = 1000 + (10-variance);
	test.assert("delay wasn't correct, was: "+time+" ms, expected between: "+low+"-"+high+" ms", time >= low && time <= high);
	test.assert('document was not on scope',this.get(0)==document);
	test.end();
});

test.begin();
var ts2 = new Date;
$(document).after(100,function()
{
	var time = new Date().getTime() - ts2;
	var low = 100 * variance, high = 100 + (10-variance);
	test.assert("delay wasn't correct, was: "+time+" ms, expected between: "+low+"-"+high+" ms", time >= low && time <= high);
	test.end();
});

test.begin();
var ts3 = new Date;
$(document).after('100ms',function()
{
	var time = new Date().getTime() - ts3;
	var low = 100 * variance, high = 100 + (10-variance);
	test.assert("delay wasn't correct, was: "+time+" ms, expected between: "+low+"-"+high+" ms", time >= low && time <= high);
	test.end();
});






