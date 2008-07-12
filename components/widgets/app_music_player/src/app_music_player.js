/**
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
Appcelerator.Widget.AppMusicPlayer =
{
	flashRequired: true,
	flashVersion: 8.0,
    path:null,
    
    setPath:function(path)
    {
        this.path = path;
    },
	/**
	 * The name of the widget
	 */
	getName: function()
	{
		return 'app:music_player';
	},
	/**
	 * A description of what the widget does
	 */
	getDescription: function()
	{
		return 'app:music_player is a widget for playing/streaming music in a webpage';
	},
	/**
	 * The version of the widget. This will automatically be corrected when you
	 * publish the widget.
	 */
	getVersion: function()
	{
		return '__VERSION__';
	},
	/**
	 * The widget spec version.  This is used to maintain backwards compatability as the
	 * Widget API needs to change.
	 */
	getSpecVersion: function()
	{
		return 1.0;
	},
	/**
	 * The widget author's full name (that's you)
	 */
	getAuthor: function()
	{
		return 'Jeff Haynie';
	},
	/**
	 * The URL for more information about the widget or the author.
	 */
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	/**
	 * This should always return true for widgets.
	 */
	isWidget: function ()
	{
		return true;
	},
	/**
	 * The widget's tag name
	 */
	getWidgetName: function()
	{
		return 'app:music_player';
	},
	/**
	 * The attributes supported by the widget as attributes of the tag.  This metadata is 
	 * important so that your widget can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [
            {name: 'src', optional: true, description: "URL to audio to use for player", type: T.pathOrUrl}
        ];
	},
	/**
	 * return an array of function names for the actions the widget supports in the widget's 
	 * on expression.
	 */
	getActions: function()
	{
		return ['load','start','stop','volume','pan'];
	},	
    load: function(id,params,data,scope,version,args)
    {
        var sound = window['sound_'+id];
        var src = null;
        if (args.length == 1)
        {
            if (!args[0].value)
            {
                var expr = args[0].key;
                src = expr.toFunction().call({data:data,params:params,id:id});
            }
            else
            {
                src = args[0].value;
            }
        }
        if (src)
        {
            sound.stop();
            sound.loadSound(src,true);
        }
    },
    start: function(id,params,data,scope,version,args)
    {
        var sound = window['sound_'+id];
        sound.start();
    },
    stop: function(id,params,data,scope,version,args)
    {
        var sound = window['sound_'+id];
        sound.stop();
    },
    volume: function(id,params,data,scope,version,args)
    {
        var sound = window['sound_'+id];
        if (args.length == 1)
        {
            var vol = parseInt(args[0].key);
            sound.setVolume(vol);
        }
    },
    pan: function(id,params,data,scope,version,args)
    {
        var sound = window['sound_'+id];
        if (args.length == 1)
        {
            var pan = parseInt(args[0].key);
            sound.setPan(pan);
        }
    },
	/**
	 * this method will be called after the widget has been built, the content replaced and available
	 * in the DOM and when it is ready to be compiled.
	 *
	 * @param {object} parameters
	 */
	compileWidget: function(parameters)
	{
        var sound = new Sound({'swfLocation':this.path+'js/SoundBridge.swf'});
        var src = parameters['src'];
        if (src)
        {
            var timer = null;
            var checkLoaded = function()
            {
                try
                {
                    sound.loadSound(src,true);
                    clearInterval(timer);
                }
                catch (e)
                {
                    // this happens when we're not yet loaded
                }
            };
            timer = setInterval(checkLoaded,50);
        }
        window['sound_'+parameters['id']] = sound;
        // we do this since the return from this element will set to default
        // so we want to set it to hidden after this method returns
        (function(){$(parameters['id']).style.display='none'}).defer();
	},
	/**
	 * this method will be called each time a <app:music_player> is encountered in a page. the return object gives
	 * instructions to the compiler about how to process the widget.
	 *
	 * @param {element} dom element for the <app:music_player> encountered in the page
	 * @param {object} parameters object for the attributes that <app:music_player> supports
	 */
	buildWidget: function(element,parameters)
	{
        //NOTE: we need this element to be in the DOM since we attach functions to it
		return {
			'presentation' : '',   // this is the HTML to replace for the contents <app:music_player>
			'position' : Appcelerator.Compiler.POSITION_REPLACE,  // usually the default, could be POSITION_REMOVE to remove <app:music_player> entirely
			'wire' : false,  // true to compile the contents of the presentation contents replaced above
			'compile' : true,  // true to call compileWidget once the HTML has been replaced and available in the DOM
			'parameters': null  // parameters object to pass to compileWidget
		};		
	}
};

Appcelerator.Widget.registerWidgetWithJS('app:music_player',Appcelerator.Widget.AppMusicPlayer,['Sound.js']);



