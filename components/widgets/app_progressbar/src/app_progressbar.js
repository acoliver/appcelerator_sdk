
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */



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
