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


Appcelerator.Widget.ProgressBar =
{
	getName: function()
	{
		return 'appcelerator progressbar';
	},
	getDescription: function()
	{
		return 'progressbar widget';
	},
	setPath: function(path)
	{
		this.modulePath = path;
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
		return 'Martin Robinson';
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
		return 'app:progressbar';
	},
    getAttributes: function()
    {
		var T = Appcelerator.Types;
        return [{name: 'class', optional: true, defaultValue: 'app_progressbar', type: T.cssClass},
                {name: 'width', optional: true, defaultValue: '500px', type: T.cssDimension},
                {name: 'height', optional: true, defaultValue: '30px', type: T.cssDimension},
                {name: 'message', optional: true, type: T.messageReceive},
                {name: 'property', optional: true, type: T.identifier},
                {name: 'animate', optional: true, defaultValue: 'true', type: T.bool}];
    },
	compileWidget: function(params)
	{
		var id = params['id'];
		var animate = params['animate'] == 'true';
		var element = $(id);
		
		var progressbar_border = $(id+'_progressbar_border');
		var progressbar_fill = $(id+'_progressbar_fill');
		
		Appcelerator.Compiler.addTrash(element,function()
		{
		});

		var message = params['message'];
		if (message)
		{
			var property = params['property'];
			
			$MQL(message,
			function (type, data, datatype, direction)
			{
				$D('received message = '+direction+':'+type+',data='+Object.toJSON(data));
				var value = property ? Object.getNestedProperty(data,property) : data;
                value = Math.max(0, value);
                value = Math.min(100, value);

                if (animate) {
                    $(id+'_progressbar_fill').morph('width: ' + value + '%');
                } else {
				    progressbar_fill.style.width = value + "%";
                }
			},
			element.scope, element);
		}		
	},
	buildWidget: function(element, parameters)
	{
		var className = parameters['class'];
		var width = parameters['width'];
		var height = parameters['height'];
		var id = element.id;

		var html = '';

		var borderstyle = '"width: ' + width + '; height: ' + height + '"';
		var borderid = '"' + id + '_progressbar_border"';
		html += '<div style=' + borderstyle + ' id=' + borderid;
        html += ' class="' + className + '">';

		var fillstyle = '"height: 100%;"';
		var fillid = '"' + id + '_progressbar_fill"';
		html += '<div style=' + fillstyle + ' id=' + fillid;
		html += ' class="fill">';

		html += '</div></div>';
		
		parameters['id'] = element.id;
		
		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'compile' : true,
			'wire' : true
		};
	}
};


Appcelerator.Core.loadModuleCSS('app:progressbar','progressbar.css');
Appcelerator.Widget.register('app:progressbar',Appcelerator.Widget.ProgressBar);
