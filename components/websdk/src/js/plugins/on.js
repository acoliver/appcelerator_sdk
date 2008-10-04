function smartTokenSearch(searchString, value)
{
	var validx = -1;
	if (searchString.indexOf('[') > -1 && searchString.indexOf(']')> -1)
	{
		var possibleValuePosition = searchString.indexOf(value);
		if (possibleValuePosition > -1)
		{
			var in_left_bracket = false;
			for (var i = possibleValuePosition; i > -1; i--)
			{
				if (searchString.charAt(i) == ']')
				{
					break;
				}
				if (searchString.charAt(i) == '[')
				{
					in_left_bracket = true;
					break;
				}
			}
			var in_right_bracket = false;
			for (var i = possibleValuePosition; i < searchString.length; i++)
			{
				if (searchString.charAt(i) == '[')
				{
					break;
				}
				if (searchString.charAt(i) == ']')
				{
					in_right_bracket = true;
					break;
				}
			}

			if (in_left_bracket && in_right_bracket)
			{
				validx = -1;
			} else
			{
				validx = searchString.indexOf(value);
			}
		} else validx = possibleValuePosition;
	}
	else
	{
		validx = searchString.indexOf(value);
	}
	return validx;
};


var compoundCondRE = /^\((.*)?\) then$/;

App.parseExpression = function(value,element)
{
	if (!value)
	{
		return [];
	}

	if (typeof(value)!='string')
	{
		alert('framework error: value was '+value+' -- unexpected type: '+typeof(value));
	    throw "value: "+value+" is not a string!";
	}
	value = $.gsub(value,'\n',' ');
	value = $.gsub(value,'\r',' ');
	value = $.gsub(value,'\t',' ');
	value = $.trim(value);

	var thens = [];
	var ors = $.smartSplit(value,' or ');

	for (var c=0,len=ors.length;c<len;c++)
	{
		var expression = $.trim(ors[c]);
		var thenidx = expression.indexOf(' then ');
		if (thenidx <= 0)
		{
			// we allow widgets to have a short-hand syntax for execute
			// if (Appcelerator.Compiler.getTagname(element).indexOf(':'))
			// {
			// 	expression = expression + ' then execute';
			// 	thenidx = expression.indexOf(' then ');
			// }
			// else
			// {
			// 	throw "syntax error: expected 'then' for expression: "+expression;
			// }
			throw "syntax error: expected 'then' for expression: "+expression;
		}
		var condition = expression.substring(0,thenidx);

		// check to see if we have compound conditions - APPSDK-597
		var testExpr = expression.substring(0,thenidx+5);
		var condMatch = compoundCondRE.exec(testExpr);
		if (condMatch)
		{
			var expressions = condMatch[1];
			// turn it into an array of conditions
			condition = $.smartSplit(expressions,' or ');
		}

		var elseAction = null;
		var nextstr = expression.substring(thenidx+6);
		var elseidx = smartTokenSearch(nextstr, 'else');

		var increment = 5;
		if (elseidx == -1)
		{
			elseidx = nextstr.indexOf('otherwise');
			increment = 10;
		}
		var action = null;
		if (elseidx > 0)
		{
			action = nextstr.substring(0,elseidx-1);
			elseAction = nextstr.substring(elseidx + increment);
		}
		else
		{
			action = nextstr;
		}

		var nextStr = elseAction || action;
		var ifCond = null;
		var ifIdx = nextStr.indexOf(' if expr[');

		if (ifIdx!=-1)
		{
			var ifStr = nextStr.substring(ifIdx + 9);
			var endP = ifStr.indexOf(']');
			if (endP==-1)
			{
				throw "error in if expression, missing end parenthesis at: "+action;
			}
			ifCond = ifStr.substring(0,endP);
			if (elseAction)
			{
				elseAction = nextStr.substring(0,ifIdx);
			}
			else
			{
				action = nextStr.substring(0,ifIdx);
			}
			nextStr = ifStr.substring(endP+2);
		}

		var delay = 0;
		var afterIdx =  smartTokenSearch(nextstr, 'after ');

		if (afterIdx!=-1)
		{
			var afterStr = nextstr.substring(afterIdx+6);
			delay = timeFormat(afterStr);
			if (!ifCond)
			{
				if (elseAction)
				{
					elseAction = nextStr.substring(0,afterIdx-1);
				}
				else
				{
					action = nextStr.substring(0,afterIdx-1);
				}
			}
		}

		thens.push([null,condition,action,elseAction,delay,ifCond]);
	}
	return thens;
};

var ONE_SECOND = 1000;
var ONE_MINUTE = 60000;
var ONE_HOUR = 3600000;
var ONE_DAY = 86400000;
var ONE_WEEK = 604800000;
var ONE_MONTH = 18748800000; // this is rough an assumes 31 days
var ONE_YEAR = 31536000000;

App.timeFormat = function(value)
{
	var str = '';
	var time = 0;

	for (var c=0,len=value.length;c<len;c++)
	{
		var ch = value.charAt(c);
		switch (ch)
		{
			case ',':
			case ' ':
			{
				str = '';
				break;
			}
			case 'm':
			{
				if (c + 1 < len)
				{
					var nextch = value.charAt(c+1);
					if (nextch == 's')
					{
						time+=parseInt(str);
						c++;
					}
				}
				else
				{
					time+=parseInt(str) * ONE_MINUTE;
				}
				str = '';
				break;
			}
			case 's':
			{
				time+=parseInt(str) * ONE_SECOND;
				str = '';
				break;
			}
			case 'h':
			{
				time+=parseInt(str) * ONE_HOUR;
				str = '';
				break;
			}
			case 'd':
			{
				time+=parseInt(str) * ONE_DAY;
				str = '';
				break;
			}
			case 'w':
			{
				time+=parseInt(str) * ONE_WEEK;
				str = '';
				break;
			}
			case 'y':
			{
				time+=parseInt(str) * ONE_YEAR;
				str = '';
				break;
			}
			default:
			{
				str+=ch;
				break;
			}
		}
	}

	if (str.length > 0)
	{
		time+=parseInt(str);
	}

	return time;
};

var conds = [];

App.regCond = function(re,fn)
{
	conds.push({re:re,fn:fn});
};  

App.processCond = function(el,info)
{
	var f = false;
	$.each(conds,function()
	{
		if (this.re.test(info.cond))
		{
			f = true;
			this.fn.call(el,info);
			return false;
		}
	});
	if (!f)
	{
		//TODO: not found
		console.error('not match for cond = '+cond);
	}
};

$.fn.on = function(value,state)
{
	var el = $(this);
	var expr = App.parseExpression(value);
	$.each(expr,function()
	{
		var p = App.extractParameters(this[2]);
		var ep = this[3] ? App.extractParameters(this[3]) : null;
		var param = 
		{
			cond: this[1],
			action: p.name,
			actionParams: p.params,
			elseAction: ep ? ep.name : null,
			elseActionParams: ep ? ep.params : null,
			delay: this[4],
			ifCond: this[5],
			state: state
		};
		App.processCond(el,param);
	});
};

App.reg('on','*',function(value,state)
{
	$(this).on(value,state);
});

