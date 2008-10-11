
test.assert(typeof($.fn.script)=='function');


test.begin();
$(document).on('r:foo',function(data)
{
	test.assert(data.user == 1);
	test.end();
});
$(document).pub('r:foo',{user:1});

window.testScript = 0;

$(document).script('window.testScript = 1');
test.assert(window.testScript == 1);

test.begin();
$("<div id='testScript1' style='display:none'>click</div>").appendTo("body")
$('#testScript1').on('click then script[window.testScript++]');
$("#testScript1").click().after(200,function()
{
	test.assert('window.testScript == 2');
	test.end();
});
