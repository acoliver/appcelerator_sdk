testSuite("Another set of example tests",
{
	run:function()
	{
		test("we like math",function()
		{
			assert( 1 + 1 == 2 );
			assert( 1 * 1 == 1 );
			assert( 1 - 1 == 0 );
			assert( 1 / 1 == 1 );
		});

		test("we like strings",function()
		{
			assert( "a" + "b" == "ab" );
		});
	}
})
