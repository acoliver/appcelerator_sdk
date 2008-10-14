
var fn = function()
{
	$('#add_class_test').assertClass('foo');
	$(document).unsub('l:addClass',fn);
};

$(document).sub('l:addClass',fn).pub('l:addClass');


$('#add_attr_test').click(function()
{
	$(this).assertAttr('myattr');
}).click();

