Appcelerator.Module.Stopwatch =
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
        Appcelerator.Module.Stopwatch.stopwatches.set(id, {'date': new Date(0), 'timer_id': null});
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
            html.push('<td>');
            html.push('<div class="stopwatch_start">');
            html.push('<app:button width="100" on="click then script[Appcelerator.Module.Stopwatch.start_stop(\'' 
                    + element.id + '\')]">Start</app:button>');
            html.push('</div>');
            html.push('<div class="stopwatch_stop">');
            html.push('<app:button width="100" on="click then script[Appcelerator.Module.Stopwatch.start_stop(\'' 
                    + element.id + '\')] and l:' + element.id + '_reset">Stop</app:button>');
            html.push('</div>');
            html.push('</td>');
            html.push('<td class="stopwatch_reset">');
            html.push('<app:button disabled="true" width="100" on="click then script[Appcelerator.Module.Stopwatch.clear_time(\''
                    + element.id + '\')] and disable or l:' + element.id + '_reset then enable">Reset</app:button>');
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
        var stopwatch = Appcelerator.Module.Stopwatch.stopwatches.get(id);
        if(stopwatch.timer_id != null)
        {
            Appcelerator.Module.Stopwatch.stop(id);
        } 
        else
        {
            Appcelerator.Module.Stopwatch.start(id);
        }
    },
    stop: function(id,parameters,data,scope,version)
    {
        var stopwatch = Appcelerator.Module.Stopwatch.stopwatches.get(id);
        clearInterval(stopwatch.timer_id);
        $(id).removeClassName( "app_stopwatch_started");
        stopwatch.timer_id = null;
    },
    start: function(id,parameters,data,scope,version)
    {
        var stopwatch = Appcelerator.Module.Stopwatch.stopwatches.get(id);
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
        var stopwatch = Appcelerator.Module.Stopwatch.stopwatches.get(id);
        $(id + "_clock").innerHTML = "00:00 <span>00</span>";
        stopwatch.date = new Date(0);        
    }
    
};

Appcelerator.Core.registerModule('app:stopwatch', Appcelerator.Module.Stopwatch);
Appcelerator.Core.loadModuleCSS('app:stopwatch', 'stopwatch.css');