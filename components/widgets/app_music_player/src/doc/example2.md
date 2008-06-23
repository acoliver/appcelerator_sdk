Title: Dynamic Load Example

This is a simple example that uses the `<app:music_player>` and dynamically loads and starts playing music from a message.

++example	
<app:music_player on="l:load then load[this.data.src]"> 
</app:music_player>

<app:message name="l:load" args="{'src':'http://media.libsyn.com/media/redmonk/riaweekly008.mp3'}">
</app:message>
--example

The value in the load action can be any valid Javascript expression.  The this scope has the following parameters:

+ data - the data payload of the message
+ parameters - any defined attributes defined on the `app:music_player` tag
+ id - the id of the `app:music_player` tag

