Title: Dynamically start music

This is a simple example that uses the `<app:music_player>` and dynamically starts playing music previously stopped.

++example
<app:music_player on="l:start.music then start"> 
</app:music_player>

<input type="button" value="Start" on="click then l:start.music" />
--example
	
The start action takes no parameters.


