
Appcelerator.Module.Calendar =
{
	calendarCount:0,
	
	getName: function()
	{
		return 'appcelerator calendar';
	},
	getDescription: function()
	{
		return 'calendar widget';
	},
	getVersion: function()
	{
		return 1.0;
	},
	getSpecVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Nolan Wright';
	},
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'app:calendar';
	},
	getAttributes: function()
	{
		return [{name: 'on', optional: true, description: "May be used to execute the calendar."},
				{name: 'inputId', optional: true },
				{name: 'elementId', optional: true },
				{name: 'minDate', optional: true },
				{name: 'title', optional: true, defaultValue: ''}];
	},
	execute: function(id,parameterMap,data,scope,version)
	{
		Element.show($(parameterMap['name']));
	},
	compileWidget: function(parameters)
	{
		var inputId = parameters['inputId'];
		var elementId = parameters['elementId'];
		var minDate = parameters['minDate'];
		var title = parameters['title'];
		var name = 'app_calendar_' + this.calendarCount++;
		var id = parameters['id'];
		var name = parameters['name'];
		var element = null;
		
		if (elementId)
		{
			element = $(elementId);
		}
		else
		{
			element = $(inputId);
		}
		
		YAHOO.namespace('appcelerator.calendar');
		var calendar = $(name);
		
		if (minDate)
		{
			YAHOO.appcelerator.calendar[name] = new YAHOO.widget.Calendar(name+'_cal',name,{close:false,mindate:minDate,title:title});
		}
		else
		{
			YAHOO.appcelerator.calendar[name] = new YAHOO.widget.Calendar(name+'_cal',name,{close:true,title:title});
		}

		YAHOO.appcelerator.calendar[name].render();
		YAHOO.appcelerator.calendar[name].selectEvent.subscribe(function(type,args,obj)
		{
			var dates=args[0];
			var date=dates[0];
			var year=date[0];
			var month=date[1];
			var date=date[2];
			
			if (inputId)
			{
				element.value = month + '/' + date + '/' + year;
				Appcelerator.Compiler.executeFunction(element,'revalidate');
			}
			else
			{
				element.innerHTML = month + '/' + date + '/' + year;
			}
			Element.hide(calendar);
		}, YAHOO.appcelerator.calendar[name], true);
	},
	buildWidget: function(element, parameters)
	{
		parameters['name'] = 'app_calendar_' + Appcelerator.Module.Calendar.calendarCount++;
		var html = '<div style="position:absolute;z-index:1000;display:none" id="'+parameters['name']+'"></div>';
		
		if (!parameters['inputId'] && !parameters['elementId'])
		{
			throw "inputId or elementId is required";
		}
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : html,
			'functions' : ['execute'],
			'compile' : true };	
	}
};

Appcelerator.Core.registerModuleWithJS('app:calendar',Appcelerator.Module.Calendar,['yahoo.js', 'event.js', 'dom.js', 'calendar.js']);
Appcelerator.Core.loadModuleCSS('app:calendar','calendar.css');
