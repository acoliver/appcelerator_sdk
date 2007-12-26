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
        return [{name: 'show_button', optional: true, description: "Set to false to hide button"}];
    },  
    compileWidget: function(params)
    {
        var id = params['id'];
    },
    getActions: function()
    {
        return ['start_stop'];  
    },
    buildWidget: function(element, parameters)
    {
        var html = [];
        html.push('<div id="' + element.id + '" class="stopwatch">');
        html.push('<table><tr>');
        html.push('<td><h3 id="' + element.id + '_clock">00:00 <span>00</span></h3></td>');
        if(parameters["show_button"] != "false") 
        {
            html.push('<td class="stopwatch_start"><app:button width="100" on="click then script[Appcelerator.Module.Stopwatch.start_stop(\''+element.id + '\')]">Start</app:button></td>');
            html.push('<td class="stopwatch_stop"><app:button width="100" on="click then script[Appcelerator.Module.Stopwatch.start_stop(\''+element.id + '\')]">Stop</app:button></td>');
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
        if($(id).hasClassName("app_stopwatch_started"))
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
        var timerId = Appcelerator.Module.Stopwatch.stopwatches.unset(id);
        clearInterval(timerId);
        $(id).removeClassName( "app_stopwatch_started");
    },
    start: function(id,parameters,data,scope,version)
    {
        var date = new Date(0);
        var format = function(value) 
        {
            return (10 > value) ? "0" + value : value;
        };
        
        $(id + "_clock").innerHTML = "00:00 <span>00</span>";
        
        var timerId = setInterval(function() 
        {
            var clock = $(id + "_clock");
            date.setTime(date.getTime() + 1000);
            clock.innerHTML = format(date.getUTCHours()) + ":" + format(date.getMinutes()) + " <span>" + format(date.getSeconds()) + "</span>";
        }, 1000);
        $(id).addClassName( "app_stopwatch_started");
        Appcelerator.Module.Stopwatch.stopwatches.set(id, timerId);
    }
    
};

Appcelerator.Core.registerModule('app:stopwatch', Appcelerator.Module.Stopwatch);
Appcelerator.Core.loadModuleCSS('app:stopwatch', 'stopwatch.css');