var parameterSeparatorRE = /[\$=:><!]+/;
var parameterRE = /(.*?)\[(.*)?\]/i;
var expressionRE = /^expr\((.*?)\)$/;

var numberRe = /^[-+]{0,1}[0-9]+$/;
var floatRe = /^[0-9]*[\.][0-9]*[f]{0,1}$/;
var booleanRe = /^(true|false)$/;
var quotedRe =/^['"]{1}|['"]{1}$/;
var jsonRe = /^\{(.*)?\}$/;

var STATE_LOOKING_FOR_VARIABLE_BEGIN = 0;
var STATE_LOOKING_FOR_VARIABLE_END = 1;
var STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER = 2;
var STATE_LOOKING_FOR_VALUE_BEGIN = 3;
var STATE_LOOKING_FOR_VALUE_END = 4;
var STATE_LOOKING_FOR_VALUE_AS_JSON_END = 5;

function dequote (value)
{
	if (value && typeof value == 'string')
	{
		if (value.charAt(0)=="'" || value.charAt(0)=='"')
		{
			value = value.substring(1);
		}
		if (value.charAt(value.length-1)=="'" || value.charAt(value.length-1)=='"')
		{
			value = value.substring(0,value.length-1);
		}
	}
	return value;
}

function convertInt (value)
{
	if (value.charAt(0)=='0')
	{
		if (value.length==1)
		{
			return 0;
		}
		return convertInt(value.substring(1));
	}
	return parseInt(value);
}

function decodeParameterValue (token,wasquoted)
{
	var value = null;
	if (token!=null && token.length > 0 && !wasquoted)
	{
		var match = jsonRe.exec(token);
		if (match)
		{
			value = $.evalJSON(match[0]);
		}
		if (!value)
		{
			var quoted = quotedRe.test(token);
			if (quoted)
			{
				value = dequote(token);
			}
			else if (floatRe.test(token))
			{
				value = parseFloat(token);
			}
			else if (numberRe.test(token))
			{
				value = convertInt(token);
			}
			else if (booleanRe.test(token))
			{
				value = (token == 'true');
			}
			else
			{
				value = token;
			}
		}
	}
	if (token == 'null' || value == 'null')
	{
		return null;
	}
	return value == null ? token : value;
}

function getTagname (element)
{
	if (!element) throw "element cannot be null";
	if (element.nodeType!=1) throw "node: "+element.nodeName+" is not an element, was nodeType: "+element.nodeType+", type="+(typeof element);

	//FIXME: review this
	// used by the compiler to mask a tag
	if (element._tagName) return element._tagName;

	if ($.browser.msie)
	{
		if (element.scopeName && element.tagUrn)
		{
			return element.scopeName + ':' + element.nodeName.toLowerCase();
		}
	}
	return String(element.nodeName.toLowerCase());
}

function formatValue (value,quote)
{
	quote = (quote == null) ? true : quote;

	if (value!=null)
	{
		var type = typeof(value);
		if (type == 'boolean' || type == 'array' || type == 'object')
		{
			return value;
		}
		if (value == 'true' || value == 'false')
		{
			return value == 'true';
		}
		if (value.charAt(0)=="'" && quote)
		{
			return value;
		}
		if (value.charAt(0)=='"')
		{
			value = value.substring(1,value.length-1);
		}
		if (quote)
		{
			return "'" + value + "'";
		}
		return value;
	}
	return '';
}

function getInputFieldValue (elem,dequote,local)
{
	elem = $(elem);
	
	var tagname = getTagname(elem);
	if (tagname != 'input' && tagname != 'textarea' && tagname != 'select')
	{
		return null;
	}

	local = local==null ? true : local;
	dequote = (dequote==null) ? false : dequote;

	var type = elem.attr('type') || 'text';
	var v = elem.val();

	switch(type)
	{
		case 'checkbox':
			return (v == 'on' || v == 'checked');
	}
	return formatValue(v,!dequote);
}

function getElementValue (elem, dequote, local)
{
    elem = typeof(elem) ? '#'+elem : $(elem);
    dequote = (dequote==null) ? true : dequote;

	//FIXME: review widget
    var widget = elem.widget
    if (widget)
    {
        if(elem.widget.getValue)
        {
            return elem.widget.getValue(elem.id, elem.widgetParameters);
        }
    }
    else
    {
        switch (getTagname(elem))
        {
            case 'input':
            {
                return getInputFieldValue(elem,true,local);
            }
            case 'select':
            {
                if(elem.attr('multiple'))
                {
                    var selected = [];
                    var options = elem.options;
                    var optionsLen = elem.options.length;
                    for(var i = 0; i < optionsLen; i++)
                    {
                        if(options[i].selected)
                        {
                            selected.push(options[i].value);
                        }
                    }
                    return selected;
                }
                break; // if not multi-select, we use 
            }
            case 'img':
            case 'iframe':
            {
                return elem.src;
            }
            case 'form':
            {
                //FIXME: serialize the form into JSON
                return '';
            }
        }
        // allow the element to set the value otherwise use the
        // innerHTML of the component
        if (elem.value != undefined)
        {
            return elem.value;
        }
        return elem.html();
    }
}

App.getEvaluatedValue = function (v,data,scope,isExpression)
{
	if (v && typeof(v) == 'string')
	{
		if (!isExpression && v.charAt(0)=='$')
		{
			var varName = v.substring(1);
			var elem = $('#'+varName);
			if (elem)
			{
				// dynamically substitute the value
				return getElementValue(elem,true);
			}
		}
        else if(!isExpression && !isNaN(parseFloat(v)))
        {
            //Assume that if they provided a number, they want the number back
            //this is important because in IE window[1] returns the first iframe
            return v;
        }
		else
		{
			// determine if this is a dynamic javascript
			// expression that needs to be executed on-the-fly
			var match = isExpression || expressionRE.exec(v);
			if (match)
			{
				var expr = isExpression ? v : match[1];
				var func = $.toFunction(expr);
				var s = scope ? scope : {};
				if (data)
				{
					for (var k in data)
					{
						if (typeof(k)  == 'string')
						{
							s[k] = data[k];
						}
					}
				}
				return func.call(s);
			}

			if (scope)
			{
				var result = $.getNestedProperty(scope,v,null);
				if (result)
				{
					return result;
				}
			}

			if (data)
			{
				return $.getNestedProperty(data,v,v);
			}
		}
	}
	return v;
}

/**
 * method will parse out a loosely typed json like structure
 * into either an array of json objects or a json object
 *
 * @param {string} string of parameters to parse
 * @param {boolean} asjson return it as json object
 * @return {object} value
 */
App.getParameters = function(str,asjson)
{
	if (str==null || str.length == 0)
	{
		return asjson ? {} : [];
	}

	var exprRE = /expr\((.*?)\)/;
	var containsExpr = exprRE.test(str);

	// this is just a simple optimization to 
	// check and make sure we have at least a key/value
	// separator character before we continue with this
	// inefficient parser
	if (!parameterSeparatorRE.test(str) && !containsExpr)
	{
		if (asjson)
		{
			var valueless_key = {};
			valueless_key[str] = '';
			return valueless_key;
		}
		else
		{
			return [{key:str,value:'',empty:true}];
		}
	}
	var state = 0;
	var currentstr = '';
	var key = null;
	var data = asjson ? {} : [];
	var quotedStart = false, tickStart = false;
	var operator = null;
	var expressions = containsExpr ? {} : null;
	if (containsExpr)
	{
		var expressionExtractor = function(e)
		{
			var start = e.indexOf('expr(');
			if (start < 0) return null;
			var p = start + 5;
			var end = e.length-1;
			var value = '';
			while ( true )
			{
				var idx = e.indexOf(')',p);
				if (idx < 0) break;
				value+=e.substring(p,idx);
				if (idx == e.length-1)
				{
					end = idx+1;
					break;
				}
				var b = false;
				var x = idx + 1;
				for (;x<e.length;x++)
				{
					switch(e.charAt(x))
					{
						case ',':
						{
							end = x;
							b = true;
							break;
						}
						case ' ':
						{
							break;
						}
						default:
						{
							p = idx+1;
							break;
						}
					}
				}
				if (x==e.length-1)
				{
					end = x;
					break;
				}
				if (b) break;
				value+=')';
			}
			var fullexpr = e.substring(start,end);
			return [fullexpr,value];
		};

		var ec = 0;
		while(true)
		{
			var m = expressionExtractor(str);
			if (!m)
			{
				break;
			}
			var k = '__E__'+(ec++);
			expressions[k] = m[1];
			str = str.replace(m[0],k);
		}
	}

	function transformValue(k,v,tick)
	{
		if (k && $.startsWith(k,'__E__'))
		{
			if (!asjson)
			{
				return {key:expressions[k],value:v,keyExpression:true,valueExpression:false};
			}
			else
			{
				return eval(expressions[k]);
			}
		}
		if (v && $.startsWith(v,'__E__'))
		{
			if (!asjson)
			{
				return {key:k,value:expressions[v],valueExpression:true,keyExpression:false};
			}
			else
			{
				return eval(expressions[v]);
			}
		}
		var s = decodeParameterValue(v,tick);
		if (!asjson)
		{
			return {key:k,value:s};
		}
		return s;
	}

	for (var c=0,len=str.length;c<len;c++)
	{
		var ch = str.charAt(c);
		var append = true;

		switch (ch)
		{
			case '"':
			case "'":
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_BEGIN:
					{
						quoted = true;
						append = false;
						state = STATE_LOOKING_FOR_VARIABLE_END;
						quotedStart = ch == '"';
						tickStart = ch=="'";
						break;
					}
					case STATE_LOOKING_FOR_VARIABLE_END:
					{
						var previous = str.charAt(c-1);
						if (quotedStart && ch=="'" || tickStart && ch=='"')
						{
							// these are OK inline
						}
						else if (previous != '\\')
						{
							state = STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER;
							append = false;
							key = $.trim(currentstr);
							currentstr = '';
						}
						break;
					}
					case STATE_LOOKING_FOR_VALUE_BEGIN:
					{
						append = false;
						quotedStart = ch == '"';
						tickStart = ch=="'";
						state = STATE_LOOKING_FOR_VALUE_END;
						break;
					}
					case STATE_LOOKING_FOR_VALUE_END:
					{
						var previous = str.charAt(c-1);
						if (quotedStart && ch=="'" || tickStart && ch=='"')
						{
							// these are OK inline
						}
						else if (previous != '\\')
						{
							state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
							append = false;
							if (asjson)
							{
								data[key]=transformValue(key,currentstr,quotedStart||tickStart);
							}
							else
							{
								data.push(transformValue(key,currentstr,quotedStart||tickStart));
							}
							key = null;
							quotedStart = false, tickStart = false;
							currentstr = '';
						}
						break;
					}
				}
				break;
			}
			case '>':
			case '<':
			case '=':
			case ':':
			{
				if (state == STATE_LOOKING_FOR_VARIABLE_END)
				{
					if (ch == '<' || ch == '>')
					{
						key = $.trim(currentstr);
						currentstr = '';
						state = STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER;
					}
				}
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_END:
					{
						append = false;
						state = STATE_LOOKING_FOR_VALUE_BEGIN;
						key = $.trim(currentstr);
						currentstr = '';
						operator = ch;
						break;
					}
					case STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER:
					{
						append = false;
						state = STATE_LOOKING_FOR_VALUE_BEGIN;
						operator = ch;
						break;
					}
				}
				break;
			}
			case ',':
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_BEGIN:
					{
						append = false;
						state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
						break;
					}
					case STATE_LOOKING_FOR_VARIABLE_END:
					{
						// we got to the end (single parameter with no value)
						state=STATE_LOOKING_FOR_VARIABLE_BEGIN;
						append=false;
						if (asjson)
						{
							data[currentstr]=null;
						}
						else
						{
							var entry = transformValue(key,currentstr);
							entry.operator = operator;
							entry.key = entry.value;
							entry.empty = true;
							data.push(entry);
						}
						key = null;
						quotedStart = false, tickStart = false;
						currentstr = '';
						break;
					}
					case STATE_LOOKING_FOR_VALUE_END:
					{
						if (!quotedStart && !tickStart)
						{
							state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
							append = false;
							if (asjson)
							{
								data[key]=transformValue(key,currentstr,quotedStart||tickStart);
							}
							else
							{
								var entry = transformValue(key,currentstr);
								entry.operator = operator;
								data.push(entry);
							}
							key = null;
							quotedStart = false, tickStart = false;
							currentstr = '';
						}
						break;
					}
				}
				break;
			}
			case ' ':
			{
			    break;
			}
			case '\n':
			case '\t':
			case '\r':
			{
				append = false;
				break;
			}
			case '{':
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VALUE_BEGIN:
					{
						state = STATE_LOOKING_FOR_VALUE_AS_JSON_END;
					}
				}
				break;
			}
			case '}':
			{
				if (state == STATE_LOOKING_FOR_VALUE_AS_JSON_END)
				{
					state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
					append = false;
					currentstr+='}';
					if (asjson)
					{
						data[key]=transformValue(key,currentstr,quotedStart||tickStart);
					}
					else
					{
						var entry = transformValue(key,currentstr);
						entry.operator = operator;
						data.push(entry);
					}
					key = null;
					quotedStart = false, tickStart = false;
					currentstr = '';
				}
				break;
			}
			default:
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_BEGIN:
					{
						state = STATE_LOOKING_FOR_VARIABLE_END;
						break;
					}
					case STATE_LOOKING_FOR_VALUE_BEGIN:
					{
						state = STATE_LOOKING_FOR_VALUE_END;
						break;
					}
				}
			}
		}
		if (append)
		{
			currentstr+=ch;
		}
		if (c + 1 == len && key)
		{
			//at the end
			currentstr = $.trim(currentstr);
			if (asjson)
			{
				data[key]=transformValue(key,currentstr,quotedStart||tickStart);
			}
			else
			{
				var entry = transformValue(key,currentstr);
				entry.operator = operator;
				data.push(entry);
			}
		}
	}

	if (currentstr && !key)
	{
		if (asjson)
		{
			data[key]=null;
		}
		else
		{
			var entry = transformValue(key,currentstr);
			entry.empty = true;
			entry.key = entry.value;
			entry.operator = operator;
			data.push(entry);
		}
	}
	return data;
};

function isIDRef(value)
{
	if (value)
	{
		if (typeof(value) == 'string')
		{
			return value.charAt(0)=='$';
		}
	}
	return false;
}

App.parseConditionCondition = function(actionParams,data) 
{
    var ok = true;

    if (actionParams)
    {
    	for (var c=0,len=actionParams.length;c<len;c++)
    	{
    		var p = actionParams[c];
			var negate = false, regex = false;
			if (p.empty && p.value)
			{
				// swap these out
				p.key = p.value;
				p.keyExpression = p.valueExpression;
				p.value = null;
			}
			var lhs = p.key, rhs = p.value, operator = p.operator||'';
			if (p.key && p.key.charAt(0)=='!')
			{
				negate = true;
				lhs = p.key.substring(1);
			}
			else if (p.key && p.key.charAt(p.key.length-1)=='!')
			{
				negate = true;
				lhs = p.key.substring(0,p.key.length-1);
			}
			var preLHS = lhs;
			if (p.keyExpression || isIDRef(lhs))
			{
				var out = App.getEvaluatedValue(lhs,data,data,p.keyExpression);
				if (!p.keyExpression && isIDRef(lhs) && lhs == out)
				{
					lhs = null;
				}
				else
				{
					lhs = out;
				}
			}
			else
			{
				lhs = App.getEvaluatedValue(lhs,data);
			}
			if (lhs == preLHS)
			{
				// left hand side must evaluate to a value -- if we get here and it's the same, that 
				// means we didn't find it
				lhs = null;
			}
			// mathematics
			if ((operator == '<' || operator == '>') && (rhs && typeof(rhs)=='string' && rhs.charAt(0)=='='))
			{
				operator += '=';
				rhs = rhs.substring(1);
			}
			if (rhs && typeof(rhs)=='string' && rhs.charAt(0)=='~')
			{
				regex = true;
				rhs = rhs.substring(1);
			}
			if (p.empty)
			{
				rhs = lhs;
			}
			else if (p.keyExpression || isIDRef(rhs))
			{
				var out = App.getEvaluatedValue(rhs,data,data,p.valueExpression);
				if (!p.valueExpression && isIDRef(rhs) && rhs == out)
				{
					rhs = null;
				}
				else
				{
					rhs = out;
				}
			}
			else
			{
				rhs = App.getEvaluatedValue(rhs,data);
			}
			if (regex)
			{
				var r = new RegExp(rhs);
				ok = r.test(lhs);
			}
			else if (!operator && p.empty && rhs == null)
			{
				ok = lhs;
			}
			else
			{
				switch(operator||'=')
				{
					case '<':
					{
						ok = parseInt(lhs) < parseInt(rhs);
						break;
					}
					case '>':
					{
						ok = parseInt(lhs) > parseInt(rhs);
						break;
					}
					case '<=':
					{
						ok = parseInt(lhs) <= parseInt(rhs);
						break;
					}
					case '>=':
					{
						ok = parseInt(lhs) >= parseInt(rhs);
						break;
					}
					default:
					{
						ok = String(lhs) == String(rhs);
						break;
					}
				}
			}
			if (negate)
			{
				ok = !ok;
			}
			if (!ok)
			{
				break;
			}
		}
	}
	return ok;
};

