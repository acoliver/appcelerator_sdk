
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



Appcelerator.Widget.Download =
{
	getName: function()
	{
		return 'appcelerator download';
	},
	getDescription: function()
	{
		return 'download widget';
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
		return 'Hamed Hashemi';
	},
	getModuleURL: function ()
	{
		return 'http://appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'app:download';
	},
	getActions: function()
	{
		return ['execute'];
	},	
	getAttributes: function()
	{
		return [{name: 'service', optional: false},
				{name: 'fileProperty', optional: true, defaultValue: 'file'},
				{name: 'mimetype', optional: true, defaultValue: 'application/octet-stream'},
				{name: 'mimetypeProperty', optional: true, defaultValue: 'type'},
				{name: 'error', optional: true}];
	},
	execute: function(id,parameters,data,scope)
	{
		parameters['idcount'] = parameters['idcount'] + 1;
		var targetid = parameters['id']+'_target_'+parameters['idcount'];
		
		for (var k in data)
		{
			if (typeof(data[k]) == 'string')
			{
				parameters['src'] += '&amp;' + k + '=' + data[k];
			}
		}
		
		var html = '<iframe name="'+ targetid+'" id="'+targetid+'" width="1" height="1" src="'+parameters['src']+'" style="position:absolute;top:-400px;left:-400px;width:1px;height:1px;"></iframe>';
		new Insertion.Bottom(document.body, html);
	},
	buildWidget: function(element,parameters,state)
	{
		var download = Appcelerator.ServerConfig['download'].value;
		var fileProperty = parameters['fileProperty'];
		var mimetype = parameters['mimetype'];
		var mimetypeProperty = parameters['mimetypeProperty'];
		var src = download+'?type='+parameters['service']+'&amp;fileProperty='+fileProperty+'&amp;mimetype='+mimetype+'&amp;mimetypeProperty='+mimetypeProperty;

		if (parameters['error'])
		{
			src += '&amp;error=' + error;
		}
		parameters['src'] = src;
		parameters['idcount'] = 0;
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : ''
		};
	}
};

Appcelerator.Widget.register('app:download',Appcelerator.Widget.Download);
