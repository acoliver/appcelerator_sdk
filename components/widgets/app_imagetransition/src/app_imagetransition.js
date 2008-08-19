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


Appcelerator.Widget.Imagetransition =
{
	getName: function()
	{
		return 'appcelerator imagetransition';
	},
	getDescription: function()
	{
		return 'imagetransition widget';
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
		return 'app:imagetransition';
	},
	getActions: function()
	{
		return ['execute'];
	},	
	getAttributes: function()
	{
        return [{
            name: 'on',
            optional: true,
			type: Appcelerator.Types.onExpr,
            description: "May be used to execute a new transition"
        }, {
            name: 'initial',
            optional: true,
			type: Appcelerator.Types.identifier,
            description: "The initial image URL"
        }, {
            name: 'effect',
            optional: true,
			defaultValue: 'appear',
			type: Appcelerator.Types.identifier,
            description: "The type of effect to use"
        }, {
			name: 'width',
			optional: false,
			type: Appcelerator.Types.cssDimension,
			description: "Width of the container"
        }, {
			name: 'height',
			optional: false,
			type: Appcelerator.Types.cssDimension,
			description: "Height of the container"
        }, {
			name: 'property',
			optional: true,
			defaultValue: 'image',
			type: Appcelerator.Types.identifier,
			description: "Property used in the on expression that defines the image URL"
		}];
	},
	execute: function(id,parameterMap,data,scope,version,customdata,direction,type)
	{
		var propertyName = parameterMap['property'];
		var image = data[propertyName];
		var divElement = $(parameterMap['id']);
		var imageElement = $(parameterMap['id']+'_image');
		
		if (image)
		{
			if (imageElement.src)
			{
				Element.setStyle(divElement, {backgroundImage : "url('"+imageElement.src+"')"});
				Element.setStyle(divElement, {display: 'block'});
			}
			else
			{
				Element.setStyle(divElement, {backgroundImage : "url('"+image+"')"});
				new Effect.Appear(divElement, { duration: .5, from: 0.0, to: 1.0 } );
			}
			imageElement.src = image;
			Element.setStyle(imageElement, {display: 'none'});
			
			switch (parameterMap['effect'])
			{
				case 'appear':
				case 'fade':
				{
					new Effect.Appear(imageElement, { duration: .5, from: 0.0, to: 1.0 } );
				}
			}
		}
	},
	buildWidget: function(element,parameters)
	{
		var html = '';
		var style = '';
		
		if (parameters['initial'])
		{
			style += 'background-image: url(\'' + parameters['initial'] + '\');';
		}
		else
		{
			style += 'display: none;';
		}
		if (parameters['width'])
		{
			style += 'width: ' + parameters['width'] + 'px;';
		}
		if (parameters['height'])
		{
			style += 'height: ' + parameters['height'] + 'px;';
		}
		
		html += '<div id="' + parameters['id'] +'" style="'+style+'">';
		html += '<img ';
		if (parameters['initial'])
		{
			html += ' src="' + parameters['initial'] + '"';
		}
		html += ' id="' + parameters['id'] + '_image"/>';
		html += '</div>';
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : html
	   };
	}
};

Appcelerator.Widget.register('app:imagetransition',Appcelerator.Widget.Imagetransition);
