
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
