Title: Simple Example

This is a simple example that uses the `<app:mp3player>`.
	
	<app:mp3player on="l:play then execute" property="url"></app:mp3player>

	<app:script>
		$MQ('l:play', {url: 'images/sample.mp3'});
	</app:script>
