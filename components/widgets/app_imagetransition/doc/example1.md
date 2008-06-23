Title: Rotate between two images

This is an example showing how to use the image transition widget to switch between two different images:

++example
<app:imagetransition on="l:image then execute" property="image" 
    width="150" height="200" initial="http://www.appcelerator.com/images/faces/jeff.jpg" 
    id="transition_test"></app:imagetransition>

<app:script>
	window.transition_count = 0;
	setInterval(function()
	{
		if (window.transition_count % 2 == 0)
		{
			$MQ('l:image', {image: 'http://www.appcelerator.com/images/faces/nolan.jpg'});
		}
		else
		{
			$MQ('l:image', {image: 'http://www.appcelerator.com/images/faces/jeff.jpg'});
		}
		window.transition_count++;
	}, 3000);
</app:script>
--example