Title: Dynamically set panning of playing music

This is a simple example that uses the `<app:music_player>` and dynamically set the panning of playing music.

++example
<app:music_player on="l:set.pan then pan[100]"> 
</app:music_player>

<input type="button" value="Start" on="click then l:set.pan" />
--example

The pan action takes a single integer value from 0-100.  1-49 is to the left side. 51-100 is to the right side. 0 is in the middle.



