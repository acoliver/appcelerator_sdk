//
// Processor for controls
//
Appcelerator.Compiler.registerAttributeProcessor('*','control',
{
	handle: function(element,attribute,value)
	{
		var compiler = function()
		{
			Appcelerator.Compiler.compileElementChildren(element);
		};
		
		var type;
		var options = Appcelerator.Compiler.parseDeclarativeUIExpr(value)
		element.stopCompile=true;
		Appcelerator.loadUIManager("control",options.type,element,options.args,false,compiler);

	},
	metadata:
	{
		description: (
			"create a control for an element"
		)
	}
	
});

//
// Processor for layouts
//
Appcelerator.Compiler.registerAttributeProcessor('*','layout',
{
	handle: function(element,attribute,value)
	{
		var compiler = function()
		{
			Appcelerator.Compiler.compileElementChildren(element);
		};
		
		var type;
		var options = Appcelerator.Compiler.parseDeclarativeUIExpr(value)
		element.stopCompile=true;
		Appcelerator.loadUIManager("layout",options.type,element,options.args,false,compiler);

	},
	metadata:
	{
		description: (
			"create a layout for an element"
		)
	}
	
});

//
// Processor for themes
//
Appcelerator.Compiler.registerAttributeProcessor('*','theme',
{
	handle: function(element,attribute,value)
	{
		var compiler = function()
		{
			Appcelerator.Compiler.compileElementChildren(element);
		};
		
		var type;
		var options = Appcelerator.Compiler.parseDeclarativeUIExpr(value)
		element.stopCompile=true;
		Appcelerator.loadUIManager("theme",options.type,element,options.args,false,compiler);

	},
	metadata:
	{
		description: (
			"create a theme for an element"
		)
	}
	
});

//
// Processor for behaviors
//
Appcelerator.Compiler.registerAttributeProcessor('*','behavior',
{
	handle: function(element,attribute,value)
	{
		// parse value
		var expressions = Appcelerator.Compiler.smartSplit(value,' and ');
		var count = 0;
		var compiler = function()
		{
			count++;
			if (count == expressions.length)
			{
				Appcelerator.Compiler.compileElementChildren(element);
			}
		};
		for (var i=0;i<expressions.length;i++)
		{
			var type;
			var options = Appcelerator.Compiler.parseDeclarativeUIExpr(expressions)
			if (i == 0) element.stopCompile=true;
			Appcelerator.loadUIManager("behavior",options.type,element,options.args,false,compiler);
		}

	},
	metadata:
	{
		description: (
			"create a behavior for an element"
		)
	}
	
});

//
// Helper function for parsing control attributes
//
Appcelerator.Compiler.parseDeclarativeUIExpr = function(value)
{
	var args = {};
	if (value.indexOf("[") == -1)
	{
		type = value;
	}
	else
	{
		var expr = value.replace("[",",").replace("]","");
		var pieces = expr.split(",")
		for (var i=0;i<pieces.length;i++)
		{
			if (i==0)type = pieces[i].trim();
			else
			{
				var pair = pieces[i].split("=");
				args[pair[0].trim()] = pair[1].trim();					
			}
		}
	}
	return {type:type, args:args}
	
};

//
// Old "set" attribute
//
Appcelerator.Compiler.registerAttributeProcessor('*','set',
{
	handle: function(element,attribute,value)
	{
		Element.addClassName(element,'container');

		// parse value
		var expressions = Appcelerator.Compiler.smartSplit(value,' and ');
		var count = 0;
		var compiler = function()
		{
			count++;
			if (count == expressions.length)
			{
				Appcelerator.Compiler.compileElementChildren(element);
			}
		};
		for (var i=0;i<expressions.length;i++)
		{
			// turn into comma-delimited string
			var delimitedString = expressions[i].replace("[",",").replace("]","");
			var a = delimitedString.split(",");
			
			// syntax: attribute[attributeType,arg1=val1,arg2=val2]
			var ui;
			var type;
			var args = {};

			for (var j=0;j<a.length;j++)
			{
				if (j==0)ui = a[0].trim();
				else if (j==1)type = a[1].trim();
				else
				{
					var pair = a[j].split("=");
					args[pair[0].trim()] = pair[1].trim();
				} 
			}
			if (i == 0) element.stopCompile=true;
			Appcelerator.loadUIManager(ui,type,element,args,false,compiler);
		}
	},
	metadata:
	{
		description: (
			"set visual properties for an element"
		)
	}
});