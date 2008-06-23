Title: Dynamically stop music

This is a simple example that uses the `<app:music_player>` and dynamically stops playing music.
	
++example
<app:music_player on="l:stop.music then stop"> 
</app:music_player>

<input type="button" value="Stop" on="click then l:stop.music" />
--example

The stop action takes no parameters.


