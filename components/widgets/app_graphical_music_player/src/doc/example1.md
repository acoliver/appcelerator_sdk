Title: Simple Example

This is a simple example that uses the `<app:graphical_music_player>`.
	
<app:graphical_music_player id="player" property="tracks" now_playing_message="l:now_playing" theme=""
        on="r:select.album.response then set_playlist and play or r:init.playlist.response then set_playlist">
</app:graphical_music_player>
	
Theme can be either "transparent" or "empty"

This widget requires '<app:music_player>'
