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
		return 'http://www.appcelerator.org';
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
