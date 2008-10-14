$(document).sub('l:addClass',function()
{
	$.info('in add class code')
	$('#add_class_test').assertClass('foo');
	
}).pub('l:addClass');


$('#add_attr_test').click(function()
{
	$(this).assertAttr('myattr');
	
}).click();

