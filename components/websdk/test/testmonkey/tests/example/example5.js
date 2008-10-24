testSuite("Example for testing built in async events","example/example2.html",
{
	run:function()
	{
		testAsync("test click event",1000,function()
		{
			var count = 0, total = 4;
			
			function finish ()
			{
				count+=1;
				if (count == total)
				{
					end();
				}
			}
			
			$("#test1").click(function()
			{
				assert(true);
				finish();
			});
			
			$("#test1").on("click",function()
			{
				assert(true);
				finish();
			});
			
			$(document).sub("l:foo.click",function()
			{
				assert(true);
				finish();
			});
			
			$("#test1").click();
			
			assert( $('#bar').html() == 'bar' );
			finish();
		});
	}
})
