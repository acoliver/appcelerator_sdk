Title: Simple Example

This is a simple example that uses the `<app:mp3player>`.

++example
<app:mp3player on="l:play then execute" property="url"></app:mp3player>

<app:script>
	$MQ('l:play', {url: 'http://media.libsyn.com/media/redmonk/riaweekly008.mp3'});
</app:script>
--example