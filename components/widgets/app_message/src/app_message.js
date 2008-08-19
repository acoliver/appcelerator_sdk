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


Appcelerator.Widget.Message =
{
	getName: function()
	{
		return 'appcelerator message';
	},
	getDescription: function()
	{
		return 'message widget for generating messages (either remote or local)';
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
		return 'Jeff Haynie';
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
		return 'app:message';
	},
	getActions: function()
	{
		return ['execute','stop'];
	},	
	getAttributes: function()
	{
        var T = Appcelerator.Types;
        return [{
            name: 'on',
            optional: true,
            type: T.onExpr,
            description: "May be used to express when the message should be fired (executed)."
        }, {
            name: 'name',
            optional: false,
            type: T.messageSend,
            description: "The name of the message to be fired."
        }, {
            name: 'args',
            optional: true,
            type: T.json,
            description: "The argument payload of the message."
        }, {
            name: 'version',
            optional: true,
            description: "The version attached to the message."
        }, {
            name: 'interval',
            optional: true,
            type: T.time,
            description: "Indicates that an time interval that the message will continously be fired."
        }]
	},
	
	execute: function(id,parameterMap,data,scope,version)
    {
        Appcelerator.Widget.Message.sendMessage(parameterMap);
    },
    stop: function(id,parameterMap,data,scope,version)
    {
        var timer = parameterMap['timer'];
        if(timer)
        {
            clearInterval(timer);
            parameterMap['timer'] = null;
        }
        else
        {
            $D('Message '+parameterMap['name']+' is not currently sending, cannot stop');
        }
    },
	compileWidget: function(parameters)
	{
		Appcelerator.Widget.Message.sendMessage(parameters);
	},
	buildWidget: function(element, attributes)
	{
		var name = attributes['name'];
		var args = attributes['args'];
		var version = attributes['version'];
		var on = attributes['on'];
		
		if (args)
		{
			args = String.unescapeXML(args).replace(/\n/g,'').replace(/\t/g,'');
		}
		
		var interval = attributes['interval'];
		
		var parameters = {args:args, name:name, scope:element.scope, interval:interval,version:version};
		
		if (on)
		{
			return {
				'position' : Appcelerator.Compiler.POSITION_REMOVE,
				'parameters': parameters
			};
		}
		else
		{
			return {
				'position' : Appcelerator.Compiler.POSITION_REMOVE,
				'compile': true,
				'parameters': parameters
			};
		}
	},
	/*
	 * If the widget has an interval set, begin sending polling messages,
	 * otherwise send a one-shot message.
	 */
	sendMessage: function(params)
	{
		var name = params.name;
		var args = params.args;
		var version = params.version;
		var scope = params.scope;
		var interval = params.interval;
		var data = null;
		
		if (args && args != 'null')
        {
            data = Object.evalWithinScope(args, window);
        }

        if (interval == null || !params['timer']) $MQ(name, data, scope, version);      
        if (interval != null)
        {
            var time = Appcelerator.Util.DateTime.timeFormat(interval);

            if (time > 0 && !params['timer'])
            {
                params['timer'] = setInterval(function()
                {
                    if (args && args != 'null')
                    {
                    	// re-evaluate each time so you can dynamically change data each interval
                    	data = Object.evalWithinScope(args, window);
                    }
                    $MQ(name, data, scope, version);
                }, time);
            }
        }
	}
};

Appcelerator.Widget.register('app:message',Appcelerator.Widget.Message);
