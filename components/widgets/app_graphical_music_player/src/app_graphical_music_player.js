
Appcelerator.Widget.AppGraphicalMusicPlayer =
{
    
    players: {},
	/**
	 * The name of the widget
	 */
	getName: function()
	{
		return 'app:graphical_music_player';
	},
	/**
	 * A description of what the widget does
	 */
	getDescription: function()
	{
		return 'app:graphical_music_player puts a graphical shell around the app:music_player widget';
	},
	/**
	 * The version of the widget. This will automatically be corrected when you
	 * publish the widget.
	 */
	getVersion: function()
	{
		return "__VERSION__";
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
		return 'Tejus Parikh';
	},
	/**
	 * The URL for more information about the widget or the author.
	 */
	getModuleURL: function ()
	{
		return 'http://appcelerator.org';
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
		return 'app:graphical_music_player';
	},
	/**
	 * The attributes supported by the widget as attributes of the tag.  This metadata is 
	 * important so that your widget can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;

		return [{
		    name: 'property',
    		optional: true,
    		defaultValue: 'playlist',
    		type: Appcelerator.Types.identifier,
    		description: "Property used in the on expression that defines the playist (a list of {id, name, url})"
		}, {
		    name: 'now_playing_message',
    		optional: true,
    		defaultValue: 'l:now_playing',
    		type: Appcelerator.Types.identifier,
    		description: "Message to be played whenever the track changes"  
		}, {
		    name: 'theme',
		    optional: true,
		    defaultValue: '',
		    type: Appcelerator.Types.identifier,
		    description: "This can either be 'transparent' or 'blank'"
		}];
	},
	/**
	 * return an array of function names for the actions the widget supports in the widget's 
	 * on expression.
	 */
	getActions: function()
	{
		return ["set_playlist", "next", "previous", "play", "stop"];
	},	
	/**
	 * Sets the playist from named 'property' attribute
	 */
	set_playlist: function(id,params,data,scope,version,args) 
	{
	    var myinfo = Appcelerator.Widget.AppGraphicalMusicPlayer.players[id];
	    myinfo.playlist = data[params['property']];
	    myinfo.current_track = 0;
	    
		var sound = window['sound_'+id+'_player'];
		sound.onSoundComplete = function() {
		    Appcelerator.Widget.AppGraphicalMusicPlayer.next(id,params,data,scope,version,args);
		};
	},
	next: function(id,params,data,scope,version,args) 
	{
    	var myinfo = Appcelerator.Widget.AppGraphicalMusicPlayer.players[id];
	    var track = myinfo.current_track + 1;
	    if(myinfo.playlist.length > track) {
	        myinfo.current_track++;
    	    var mytrack = myinfo.playlist[track];
    	    $MQ(params['now_playing_message'], {'id': mytrack.id, 'name': mytrack.name, 'src': mytrack.url});
	    }
	},
	previous: function(id,params,data,scope,version,args) 
	{
    	var myinfo = Appcelerator.Widget.AppGraphicalMusicPlayer.players[id];
	    var track = myinfo.current_track - 1;
	    if(track >= 0) {
	        myinfo.current_track--;
    	    var mytrack = myinfo.playlist[track];
    	    $MQ(params['now_playing_message'], {'id': mytrack.id, 'name': mytrack.name, 'src': mytrack.url});
	    }
	},
	play: function(id,params,data,scope,version,args)
	{
	    var myinfo = Appcelerator.Widget.AppGraphicalMusicPlayer.players[id];
	    if(data && typeof data['id'] != "undefined") 
	    {
	        var i = 0, length = myinfo.playlist.length;
	        for(; i < length; i++) {
	            if(myinfo.playlist[i].id == data['id']) {
	                break;
	            } 
	        }   
	        if(i < length) {
	            myinfo.current_track = i;
            }
	    }	    
        if(myinfo.playlist.length > myinfo.current_track) {
    	    var mytrack = myinfo.playlist[myinfo.current_track];
    	    $MQ(params['now_playing_message'], {'id': mytrack.id, 'name': mytrack.name, 'src': mytrack.url});
	    }
	},
	stop: function(id,params,data,scope,version,args) 
	{
	    var myinfo = Appcelerator.Widget.AppGraphicalMusicPlayer.players[id];
	    $MQ('l:' + id + '_stop');
	},
	/**
	 * this method will be called after the widget has been built, the content replaced and available
	 * in the DOM and when it is ready to be compiled.
	 *
	 * @param {object} parameters
	 */
	compileWidget: function(parameters)
	{
	    var id = parameters['id'];
		this.players[id] = {
		    'playlist': null,
		    'current_track': 0
		};
		
		var Player = Appcelerator.Widget.AppGraphicalMusicPlayer;
		$(id + '_play_button').observe("click", function() { Player.play(id, parameters); });
		$(id + '_stop_button').observe("click", function() { Player.stop(id, parameters); });
		$(id + '_next_button').observe("click", function() { Player.next(id, parameters); });
		$(id + '_prev_button').observe("click", function() { Player.previous(id, parameters); });
		new Control.Slider(id + '_handle', id + '_slider', {
		    range:$R(0,100),
		    sliderValue: 100,
            onSlide:function(v){var sound = window['sound_'+id+'_player']; sound.setVolume(v);},
            onChange:function(v){var sound = window['sound_'+id+'_player']; sound.setVolume(v);}
        });
	},
	/**
	 * this method will be called each time a <app:graphical_music_player> is encountered in a page. the return object gives
	 * instructions to the compiler about how to process the widget.
	 *
	 * @param {element} dom element for the <app:graphical_music_player> encountered in the page
	 * @param {object} parameters object for the attributes that <app:graphical_music_player> supports
	 */
	buildWidget: function(element,parameters)
	{
	    var id = element.id;
	    var theme = parameters['theme'];
	    if(theme.length > 0) {
	        theme = "AGMP_" + theme;
	    }
        var html = [];
    
        html.push('<div class="' + theme + '">');
        html.push('<div id="' + id + '" class="app_graphical_music_player">');
        html.push('    <div class="button_bg">');
        html.push('        <div id="' + id + '_prev_button" class="prev_button"></div>');
        html.push('        <div id="' + id + '_play_button" class="play_button" on="' + parameters['now_playing_message'] + ' then hide or l:' + id + '_stop then show"></div>');
        html.push('        <div id="' + id + '_stop_button" style="display: none" class="stop_button" on="' + parameters['now_playing_message'] + ' then show or l:' + id + '_stop then hide"></div>');
        html.push('        <div id="' + id + '_pause_button" style="display: none" class="pause_button"></div>');
        html.push('        <div id="' + id + '_next_button" class="next_button"></div>');
        html.push('    </div>');
        html.push('    <div class="window">');
        html.push('        <table>');
        html.push('            <tr><td>');
        html.push('                <span class="artist" on="' + parameters['now_playing_message'] + ' then value[name]"></span>');
        html.push('            </td></tr>');
        html.push('        </table>');
        html.push('    </div>');
        html.push('    <div id="' + id  + '_slider_box" class="slider_box">');
        html.push('        <div id="' + id + '_slider" class="slider" style="width:100px;height:5px;">');
        html.push('            <div style="background-color:#739ca1;height:5px;width:100px;position:absolute;left: 21px; top: 7px"></div>')
        html.push('            <div id="' + id + '_handle" class="slider_handle" style=""> </div>');
        html.push('        </div>');
        html.push('    </div>');
        html.push('</div>');
        
        
        
        html.push('    <app:music_player id="' + id + '_player" on="'); 
        html.push(parameters['now_playing_message'] + ' then load[this.data.src]');
        html.push('or l:' + id + '_stop then stop');
        html.push(' ">');
        html.push('    </app:music_player>');
        html.push('</div>');
        
		return {
			'presentation' : html.join(' '),   // this is the HTML to replace for the contents <app:graphical_music_player>
			'position' : Appcelerator.Compiler.POSITION_REPLACE,  // usually the default, could be POSITION_REMOVE to remove <app:graphical_music_player> entirely
			'wire' : true,  // true to compile the contents of the presentation contents replaced above
			'compile' : true,  // true to call compileWidget once the HTML has been replaced and available in the DOM
			'parameters': null  // parameters object to pass to compileWidget
		};		
	}
};

Appcelerator.Widget.loadWidgetCSS('app:graphical_music_player','music_player.css');
Appcelerator.Widget.requireCommonJS('scriptaculous/slider.js',function()
{
    Appcelerator.Widget.register('app:graphical_music_player',Appcelerator.Widget.AppGraphicalMusicPlayer);
});