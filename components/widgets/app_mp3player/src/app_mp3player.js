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


Appcelerator.Widget.Mp3player =
{
	getName: function()
	{
		return 'appcelerator mp3player';
	},
	getDescription: function()
	{
		return 'mp3player widget is a flash based mp3 player based from http://www.1pixelout.net/code/audio-player-wordpress-plugin';
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
		return 'app:mp3player';
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
            description: "Load up the mp3 player with a specified URL"
        }, {
			name: 'property',
			optional: true,
			defaultValue: 'url',
			type: Appcelerator.Types.identifier,
			description: "Property used in the on expression that defines the mp3 URL"
		}];
	},
	audioplayerId: 0,
	execute: function(id,parameterMap,data,scope,version,customdata,direction,type)
	{
		var propertyName = parameterMap['property'];
		var mp3 = data[propertyName];

		if (mp3)
		{
			var element = $(parameterMap['id']);
			var playerDiv = $(parameterMap['id'] + '_player');
			if (playerDiv)
			{
				Element.remove(playerDiv);
			}
			var audioplayerId = ++Appcelerator.Widget.Mp3player.audioplayerId;

			var swf = Appcelerator.WidgetPath + 'app_mp3player/swf/player.swf';
			var html = '<div id="' + parameterMap['id'] + '_player">';
			html += '<object type="application/x-shockwave-flash" data="' + swf + '" id="audioplayer' + audioplayerId + '" height="24" width="290">';
			html += '<param name="movie" value="' + swf + '">';
			html += '<param name="FlashVars" value="playerID='+audioplayerId+'&amp;soundFile='+mp3+'">';
			html += '<param name="quality" value="high">';
			html += '<param name="menu" value="false">';
			html += '<param name="wmode" value="transparent">';
			html += '</object>';
			html += '</div>';

			element.innerHTML = html;
		}
	},
	buildWidget: function(element,parameters)
	{
		var html = '<div id="' + parameters['id'] + '"></div>';

		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : html
	   };
	}
};

Appcelerator.Widget.registerWithJS('app:mp3player', Appcelerator.Widget.Mp3player,['audio-player.js']);
