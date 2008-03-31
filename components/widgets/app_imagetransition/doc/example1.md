Title: Simple Example

This is a simple example that uses the `<app:imagetransition>`.
	
	<app:imagetransition on="l:image then execute" property="image" initial="images/sfgate.jpg" width="150" height="150"></app:imagetransition>
		
	<app:script>
		$MQ('l:image', {image: 'images/tree.jpg'});
	</app:script>