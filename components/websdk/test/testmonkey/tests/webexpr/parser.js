testSuite("web expression parser tests","webexpr/parser.html",
{
	run:function()
	{
		test("l:test[!foo]",function()
		{
			$('#test').on('l:test[!foo] then value[passed] else value[failed]');
			$('#test').pub('l:test').assertPub('l:test');
			assert($('#test').html()=='passed');
		});
		
		test("l:test[length!=0] (length is not present in payload)",function()
		{
			$('#test').on('l:test[length!=0] then value[passed] else value[failed]');
			$('#test').pub('l:test').assertPub('l:test');
			assert($('#test').html()=='passed');
		});
		
		test("multiple payloads with one missing",function()
		{
			$('#test').on('l:test[id=wem1,countfoo=100] then value[failed] else value[passed]');
			$('#test').pub('l:test',{id:'wem1',count:1});
			$('#test').assertPub('l:test',{id:'wem1',count:1});
			assert($('#test').html()=='passed')
		});
		
		test(">0",function()
		{
			$('#test').on('l:test[count>0] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=1]');
			$('#test').assertPub('l:test',{id:'wem1',count:1});
			assert($('#test').html()=='passed');
		});
		
		test(">1",function()
		{
			$('#test').on('l:test[count>1] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=2]');
			$('#test').assertPub('l:test',{id:'wem1',count:2});
			assert($('#test').html()=='passed');
		});
		
		test("multiple math in expression",function()
		{
			$('#test').on('l:test[count>99,count<101,count=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("<101",function()
		{
			$('#test').on('l:test[count<101] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("<=100",function()
		{
			$('#test').on('l:test[count<=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test(">=100",function()
		{
			$('#test').on('l:test[count>=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("!>101",function()
		{
			$('#test').on('l:test[!count>101] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("!>=101",function()
		{
			$('#test').on('l:test[!count>=101] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("!<101",function()
		{
			$('#test').on('l:test[!count<101] then value[failed] else value[passed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("!<=200",function()
		{
			$('#test').on('l:test[!count<=200] then value[failed] else value[passed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("!=200",function()
		{
			$('#test').on('l:test[count!=200] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("=100",function()
		{
			$('#test').on('l:test[count=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("=~100",function()
		{
			$('#test').on('l:test[count=~100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("=~1",function()
		{
			$('#test').on('l:test[count=~1] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("=~^1",function()
		{
			$('#test').on('l:test[count=~^1] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("=~0$",function()
		{
			$('#test').on('l:test[count=~0$] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("!=~9$",function()
		{
			$('#test').on('l:test[!count=~9$] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("count",function()
		{
			$('#test').on('l:test[count] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("!foobar",function()
		{
			$('#test').on('l:test[!foobar] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("count,!foobar",function()
		{
			$('#test').on('l:test[count,!foobar] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});

		test("expr(this.count > 1)",function()
		{
			$('#test').on('l:test[expr(this.count > 1)] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').assertPub('l:test',{'id':'wem1','count':100});
			assert($('#test').html()=='passed');
		});
		
		test("expr(this.count > 1),count=100",function()
		{
			$('#test').on('l:test[expr(this.count > 1),count=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("expr(this.count > 1),count>99,expr(this.count==100)",function()
		{
			$('#test').on('l:test[expr(this.count > 1),count>99,expr(this.count==100)] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=='passed');
		});
		
		test("inline expression with JS",function()
		{
			var time = new Date;
			$('#test').on("l:test then value[value=expr('[' + '" + time + "' + '] ' + this.direction+':' + this.type + ' = ' + 'PASSED')]");
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert($('#test').html()=="[" + time + "] local:test = PASSED");
		});

		test("inline script expression with JS",function()
		{
			var time = new Date;
			var self = this;
			$('#test').on("l:test then script[window.scriptTest='hello']");
			$('#test').pub('l:test[id=wem1,count=100]');
			$('#test').assertPub('l:test',{id:'wem1',count:100});
			assert(window.scriptTest == 'hello');
		});
		
	}
});