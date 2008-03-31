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
		return '1.0';
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
			'presentation' : html,
	   };
	}
};

Appcelerator.Widget.register('app:imagetransition',Appcelerator.Widget.Imagetransition);
