testSuite("Set of tests for Test Monkey",
{
	run:function()
	{
		test("test that succeeds",function()
		{
			assert( 1 + 1 == 2);
			assert(true);
		});
		testAsync("test with explicit failure",1000,function()
		{
			assert( 1 + 1 == 2);
			assert(true);
			fail("this is a message")
		});
		testAsync("test to show multiple assert failures",1000,function()
		{
			assert(1 + 1 < 0);
			assert(1 + 1 == 2);
			assert("yes");
			assert(false);
			end();
		});
		testAsync("test to show undefined error",1000,function()
		{
			assert(1 + foo);
			end();
		});

		test("inline failures",function()
		{
			assert(false);
		});
		test("empty test",function()
		{
			
		});
	}
})
