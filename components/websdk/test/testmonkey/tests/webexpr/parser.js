testSuite("web expression parser tests","webexpr/webexpr.html",
{
	run:function()
	{
		testAsync("l:test[!foo]",function()
		{
			$('#test').empty().on('l:test[!foo] then value[passed] else value[failed]');
			$('#test').pub('l:test').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("l:test[length!=0] (length is not present in payload)",function()
		{
			$('#test').empty().on('l:test[length!=0] then value[passed] else value[failed]');
			$('#test').pub('l:test').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});

		testAsync("multiple payloads with one missing",function()
		{
			$('#test').empty().on('l:test[id=wem1,countfoo=100] then value[failed] else value[passed]');
			$('#test').pub('l:test',{id:'wem1',count:1}).after('20ms',function()
			{
				assert($('#test').html()=='passed')
				end();
			});
		});

		testAsync(">0",function()
		{
			$('#test').empty().on('l:test[count>0] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=1]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync(">1",function()
		{
			$('#test').empty().on('l:test[count>1] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=2]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("multiple math in expression",function()
		{
			$('#test').empty().on('l:test[count>99,count<101,count=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("<101",function()
		{
			$('#test').empty().on('l:test[count<101] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("<=100",function()
		{
			$('#test').empty().on('l:test[count<=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync(">=100",function()
		{
			$('#test').empty().on('l:test[count>=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("!>101",function()
		{
			$('#test').empty().on('l:test[!count>101] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("!>=101",function()
		{
			$('#test').empty().on('l:test[!count>=101] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("!<101",function()
		{
			$('#test').empty().on('l:test[!count<101] then value[failed] else value[passed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("!<=200",function()
		{
			$('#test').empty().on('l:test[!count<=200] then value[failed] else value[passed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("!=200",function()
		{
			$('#test').empty().on('l:test[count!=200] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("=100",function()
		{
			$('#test').empty().on('l:test[count=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("=~100",function()
		{
			$('#test').empty().on('l:test[count=~100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("=~1",function()
		{
			$('#test').empty().on('l:test[count=~1] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("=~^1",function()
		{
			$('#test').empty().on('l:test[count=~^1] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("=~0$",function()
		{
			$('#test').empty().on('l:test[count=~0$] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("!=~9$",function()
		{
			$('#test').empty().on('l:test[!count=~9$] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("count",function()
		{
			$('#test').empty().on('l:test[count] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("!foobar",function()
		{
			$('#test').empty().on('l:test[!foobar] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("count,!foobar",function()
		{
			$('#test').empty().on('l:test[count,!foobar] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("expr(this.count > 1)",function()
		{
			$('#test').empty().on('l:test[expr(this.count > 1)] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("expr(this.count > 1),count=100",function()
		{
			$('#test').empty().on('l:test[expr(this.count > 1),count=100] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("expr(this.count > 1),count>99,expr(this.count==100)",function()
		{
			$('#test').empty().on('l:test[expr(this.count > 1),count>99,expr(this.count==100)] then value[passed] else value[failed]');
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				assert($('#test').html()=='passed');
				end();
			});
		});
		
		testAsync("inline expression with JS",function()
		{
			var time = new Date;
			$('#test').empty().on("l:test then value[value=expr('[' + " + time + " + '] ' + this.direction+':' + this.type + ' => ' + ' PASSED')]");
			$('#test').pub('l:test[id=wem1,count=100]').after('20ms',function()
			{
				log($('#test').html());
				assert($('#test').html()=="[" + this + "] ");
				end();
			});
		});
		
	}
});