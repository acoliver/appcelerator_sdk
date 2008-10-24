testSuite("Example that uses external HTML content","example/example.html",
{
	run:function()
	{
		test("make sure that our setup ran",function()
		{
			log("starting test...");
			assert($("#test").html() == 'Hello');
			$('body').assertCSS('visibility','visible');
			$('#button1').assertDisabled();
			$('#button2').assertEnabled();
			$('#button1').assertVisible();
			$('#button2').assertHidden();
			$('#button1').assertCSS('font-size','24px');
			$('#button1').assertAttr('disabled','true');
			$('#button2').assertClass('myclass');
			$('#test').assertHTML('Hello');
			$('#test').assertText('Hello');
			$('#test2').assertEmpty();
			$("#checkbox1").assertValue('on');
			$("#checkbox1").assertChecked();
			$("#checkbox2").assertUnchecked();
			log("end test...");
		});
	}
})
