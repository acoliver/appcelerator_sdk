
var ts = new Date;

test.begin();
$(document).after("1s",function()
{
	test.assert("delay wasn't correct", (new Date().getTime() - ts) >= 1000);
	test.assert('document was not on scope',this.get(0)==document);
	test.end();
});

test.begin();
var ts2 = new Date;
$(document).after(100,function()
{
	test.assert("delay wasn't correct", (new Date().getTime() - ts2) >= 100);
	test.end();
});

test.begin();
var ts3 = new Date;
$(document).after('100ms',function()
{
	test.assert("delay wasn't correct", (new Date().getTime() - ts3) >= 100);
	test.end();
});






