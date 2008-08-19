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
        return '__VERSION__';
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
