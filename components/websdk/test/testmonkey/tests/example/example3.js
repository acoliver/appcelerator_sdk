testSuite("Example that has setup",
{
	setup:function()
	{
		this.foo = 1;
	},
	run:function()
	{
		test("make sure that our setup ran",function()
		{
			log('this.foo='+this.foo);
			assert( this.foo === 1 );
		});
	}
})
