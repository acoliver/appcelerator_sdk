Title: Dynamically set volume of playing music

This is a simple example that uses the `<app:music_player>` and dynamically set the volume of playing music.
	
++example
<app:music_player on="l:set.volume then volume[10]"> 
</app:music_player>

<input type="button" value="Start" on="click then l:set.volume" />
--example
	
The volume action takes a single integer value from 0-100. The lower the volume the quieter the music.