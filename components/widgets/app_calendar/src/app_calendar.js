/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/


Appcelerator.Widget.Calendar =
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
		return '__VERSION__';
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
    getActions: function()
    {
        return ['execute','close'];
    },
    getAttributes: function()
    {
        var T = Appcelerator.Types;
        return [{name: 'on', optional: true, description: "May be used to execute the calendar.", type: T.onExpr},
		        {name: 'close', optional: true, description: 'Toggle display of the close button.', type: T.bool, defaultValue: false},
				{name: 'inputId', optional: true, description: 'The id of the input element to update', type: T.identifier},
				{name: 'elementId', optional: true, description: 'Alias for inputId', type: T.identifier},
				{name: 'minDate', optional: true, description: 'The minimum allowed date', type: T.pattern(/[0-9]{1,2}\/[0-9]{1,2}(\/[0-9]{4})/)},
				{name: 'title', optional: true, description: 'The title of the calendar', defaultValue: ''},
                {name: 'titleLangid', optional: true, defaultValue: ''},
                {name: 'formatFunction', optional: true, defaultValue: 'Appcelerator.Widget.Calendar.calendartotext'},
                {name: 'todateFunction', optional: true, defaultValue: 'Appcelerator.Widget.Calendar.textToDate'}
                ];
    },
	selectDateFromInput: function(parameterMap)
	{
		if (parameterMap['inputId'] == '')
		 	return;
		var input = $(parameterMap['inputId']);
		var val = input.value;
        var todateFunction = eval(parameterMap['todateFunction']);
		var date = todateFunction(val);
		if (date==null)
			return;
		var name = parameterMap['name'];
		var cal = YAHOO.appcelerator.calendar[name];
		cal.setMonth(date.getMonth());
		cal.setYear(date.getFullYear());
		if (isNaN(date.getMonth())||isNaN(date.getDate())||isNaN(date.getFullYear()))
		 	return;
		var datestring = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
		cal.select(datestring); 
		var selectedDates = cal.getSelectedDates(); 
		var firstDate = selectedDates[0]; 
		cal.cfg.setProperty("pagedate", (firstDate.getMonth()+1) + "/" + firstDate.getFullYear()); 
		cal.render(); 
	},
    execute: function(id,parameterMap,data,scope,version)
    {
		Appcelerator.Widget.Calendar.selectDateFromInput(parameterMap);
        Element.show($(parameterMap['name']));
    },
	close: function(id, parameterMap, data, scope, version) 
	{
	    Element.hide($(parameterMap['name']));
	},
    setValue: function(id,params,value) {
        var cal = YAHOO.appcelerator.calendar[params['name']];
        if (value != "") {
            cal.select(value);
            var selectedDates = cal.getSelectedDates();
            if (selectedDates.length > 0) {
                var firstDate = selectedDates[0];
                cal.cfg.setProperty("pagedate", (firstDate.getMonth()+1) + "/" + firstDate.getFullYear());
                cal.render();
            }
        }
    },
    getValue: function(id,params) {
        return params['value'];
    },
    calendartotext: function(month,day,year) {
        return month + '/' + day + '/' + year;
    },
	textToDate: function(text) {
		if (text==undefined || text=='')
			return null;
		var nums = text.split('/');
		var date=new Date();
		date.setFullYear(parseInt(nums[2]));
		date.setMonth(parseInt(nums[0])-1);
		date.setDate(parseInt(nums[1]));
		return date;
	},
    compileWidget: function(parameters)
    {
        var inputId = parameters['inputId'];
        var elementId = parameters['elementId'];
        var minDate = parameters['minDate'];
        var title = parameters['title'];
        var titleLangid = parameters['titleLangid'];
        var formatFunction = parameters['formatFunction']
        var name = parameters['name'];
        var id = parameters['id'];
		var close = !!parameters['close'];
        var element = null;
        
        if (elementId)
        {
            element = $(elementId);
        }
        else if(inputId)
        {
            element = $(inputId);
        }
        if (titleLangid != '') {
            title = Appcelerator.Localization.get(titleLangid);
        }
        
        YAHOO.namespace('appcelerator.calendar');
        
        if (minDate)
        {
			YAHOO.appcelerator.calendar[name] = new YAHOO.widget.Calendar(name+'_cal',name,{close:close,mindate:minDate,title:title});
        }
        else
        {
            YAHOO.appcelerator.calendar[name] = new YAHOO.widget.Calendar(name+'_cal',name,{close:close,title:title});
        }

        // try to use localization keys to customize calendar behavior
        var cal = YAHOO.appcelerator.calendar[name];
        var setLocalizedProperty = function(prop) {
            var s = Appcelerator.Localization.get("Appcelerator.Widget.Calendar." + prop);
            if (s !== undefined) {
                cal.cfg.setProperty(prop, s);
            }
        };

        setLocalizedProperty("start_weekday");
        setLocalizedProperty("title");
        setLocalizedProperty("MONTHS_SHORT");
        setLocalizedProperty("MONTHS_LONG");
        setLocalizedProperty("WEEKDAYS_1CHAR");
        setLocalizedProperty("WEEKDAYS_SHORT");
        setLocalizedProperty("WEEKDAYS_MEDIUM");
        setLocalizedProperty("WEEKDAYS_LONG");
        setLocalizedProperty("DATE_DELIMITER");
        setLocalizedProperty("DATE_FIELD_DELIMITER");
        setLocalizedProperty("DATE_RANGE_DELIMITER");
        setLocalizedProperty("MY_MONTH_POSITION");
        setLocalizedProperty("MY_YEAR_POSITION");
        setLocalizedProperty("MD_MONTH_POSITION");
        setLocalizedProperty("MD_DAY_POSITION");
        setLocalizedProperty("MDY_MONTH_POSITION");
        setLocalizedProperty("MDY_DAY_POSITION");
        setLocalizedProperty("MDY_YEAR_POSITION");
        setLocalizedProperty("MY_LABEL_MONTH_POSITION");
        setLocalizedProperty("MY_LABEL_YEAR_POSITION");
        setLocalizedProperty("MY_LABEL_MONTH_SUFFIX");
        setLocalizedProperty("MY_LABEL_YEAR_SUFFIX");

        cal.render();
        cal.selectEvent.subscribe(function(type,args,obj)
        {
            var dates=args[0];
            var date=dates[0];
            
            var year=date[0];
            var month=date[1];
            var date=date[2];
            var dateString = month + '/' + date + '/' + year;
            if (formatFunction) {
                var f = eval(formatFunction);
                dateString = f(month,date,year);
            }
            
            if(element)
            {
                if (inputId)
                {
                    element.value = dateString;
                    Appcelerator.Compiler.executeFunction(element,'revalidate');
                }
                else
                {
                    element.innerHTML = dateString;
                }
            }
            else
            {
                parameters['value'] = dateString;
            }
            
            Element.hide(name);
        }, cal, true);
    },
    buildWidget: function(element, parameters)
    {
        if (!parameters.inputId && !parameters.elementId && !$(parameters.id).hasAttribute('fieldset'))
        {
            throw "inputId or elementId or fieldset is required";
        }

        parameters['name'] = 'app_calendar_' + Appcelerator.Widget.Calendar.calendarCount++;
		var html = '<div style="position:absolute;z-index:1000;display:none" id="'+parameters['name']+'"';
		
		if (parameters['on'])
		{
			html+=' on="' + parameters['on'] + '"';
		}
		html+='></div>';
        
        return {
            'position' : Appcelerator.Compiler.POSITION_REPLACE,
            'presentation' : html,
			'wire': true,
            'compile' : true 
       };    
    }
};

Appcelerator.Core.loadModuleCSS('app:calendar','calendar.css');
Appcelerator.Widget.registerWithJS('app:calendar',Appcelerator.Widget.Calendar,['yahoo.js', 'event.js', 'dom.js', 'calendar.js']);
