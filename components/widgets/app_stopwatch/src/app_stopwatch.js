/*
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

Appcelerator.Widget.Stopwatch =
{
    stopwatches: new Hash(),
    
    getName: function()
    {
        return 'appcelerator stopwatch';
    },
    getDescription: function()
    {
        return 'stopwatch widget';
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
        return 'Tejus Parikh';
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
        return 'app:stopwatch';
    },
    getAttributes: function()
    {        
        return [{
            name: 'show_button',
            optional: true,
			type: Appcelerator.Types.bool,
            description: "Set to false to hide button"
        }];
    },  
    compileWidget: function(params)
    {
        var id = params['id'];
        Appcelerator.Widget.Stopwatch.stopwatches.set(id, {'date': new Date(0), 'timer_id': null});
    },
    getActions: function()
    {
        return ['start_stop', 'clear_time'];  
    },
    buildWidget: function(element, parameters)
    {
        var html = [];
        html.push('<div id="' + element.id + '" class="stopwatch">');
        html.push('<table><tr>');
        html.push('<td><h3 id="' + element.id + '_clock">00:00 <span>00</span></h3></td>');
        if(parameters["show_button"] != "false") 
        {
			var enableReset = "l:" + element.id + "_enable_reset";
			var disableReset = "l:" + element.id + "_disable_reset";
            html.push('<td>');
            html.push('<div class="stopwatch_start">');
            html.push('<app:button width="100" on="click then script[Appcelerator.Widget.Stopwatch.start_stop(\'' 
                    + element.id + '\')] and ' + disableReset + '">Start</app:button>');
            html.push('</div>');
            html.push('<div class="stopwatch_stop">');
            html.push('<app:button width="100" on="click then script[Appcelerator.Widget.Stopwatch.start_stop(\'' 
                    + element.id + '\')] and ' + enableReset + '">Stop</app:button>');
            html.push('</div>');
            html.push('</td>');
            html.push('<td class="stopwatch_reset">');
            html.push('<app:button disabled="true" width="100" on="click then script[Appcelerator.Widget.Stopwatch.clear_time(\''
                    + element.id + '\')] and disable or ' +  enableReset + ' then enable or ' 
					+ disableReset + ' then disable">Reset</app:button>');
            html.push('</td>');
        }
        html.push('</tr></table>');
        html.push('</div>');
        return {
            'presentation' : html.join(' '),
            'position' : Appcelerator.Compiler.POSITION_REPLACE,
            'wire' : true,
            'compile': true
        };
    },
    //custom functions
    start_stop: function(id,parameters,data,scope,version)
    {
        var stopwatch = Appcelerator.Widget.Stopwatch.stopwatches.get(id);
        if(stopwatch.timer_id != null)
        {
            Appcelerator.Widget.Stopwatch.stop(id);
        } 
        else
        {
            Appcelerator.Widget.Stopwatch.start(id);
        }
    },
    stop: function(id,parameters,data,scope,version)
    {
        var stopwatch = Appcelerator.Widget.Stopwatch.stopwatches.get(id);
        clearInterval(stopwatch.timer_id);
        $(id).removeClassName( "app_stopwatch_started");
        stopwatch.timer_id = null;
    },
    start: function(id,parameters,data,scope,version)
    {
        var stopwatch = Appcelerator.Widget.Stopwatch.stopwatches.get(id);
        var format = function(value) 
        {
            return (10 > value) ? "0" + value : value;
        };
        
        var timerId = setInterval(function() 
        {
            var date = stopwatch.date;
            var clock = $(id + "_clock");
            date.setTime(date.getTime() + 1000);
            clock.innerHTML = format(date.getUTCHours()) + ":" + format(date.getMinutes()) + " <span>" + format(date.getSeconds()) + "</span>";
        }, 1000);
        $(id).addClassName( "app_stopwatch_started");
        stopwatch.timer_id = timerId;
    },
    clear_time: function(id,parameters,data,scope,version)
    {
        var stopwatch = Appcelerator.Widget.Stopwatch.stopwatches.get(id);
        $(id + "_clock").innerHTML = "00:00 <span>00</span>";
        stopwatch.date = new Date(0);        
    }
    
};

Appcelerator.Core.loadModuleCSS('app:stopwatch', 'stopwatch.css');
Appcelerator.Widget.register('app:stopwatch', Appcelerator.Widget.Stopwatch);
