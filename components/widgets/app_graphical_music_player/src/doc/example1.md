Title: Graphical Music Player Usage

This widget depends on `app:music_player` and wrappers an interactive gui around it.
The widget can be controlled via the interface buttons or through messages.  
On a track change it can be configured to send a message with the current track in the playlist
as the data-playload.


<app:graphical_music_player property="tracks"
    on="l:set.playlist then set_playlist or l:play_track then play"
    now_playing_message="l:now_playing"
></app:graphical_music_player>

The playlist should be an array of objects that look like:
[
    {'id': 1, 'name': 'Xpander', 'url': '/music/xpander.mp3'},
    {'id': 2, 'name': 'Zombie Nation','url': '/music/zombie_nation.mp3'},
    {'id': 3, 'name': 'Hypnotising', 'url': '/music/hypnotising.mp3'},
    {'id': 4, 'name': 'For An Angel', 'url': '/music/for_an_angel.mp3'}
]

The actions "next", "previous", "play", "stop" do what they say they do, and do not take any parameters