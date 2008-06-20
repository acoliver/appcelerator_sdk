Title: Simple Example

This is a simple example that uses the `<app:imagetransition>`.
	
    <app:imagetransition on="l:image then execute" property="image" 
        width="150" height="150" initial="../images/sfgate.jpg" 
        id="transition_test"></app:imagetransition>
        
    <app:script>
    	window.transition_count = 0;
    	setInterval(function()
    	{
    		if (window.transition_count % 2 == 0)
    		{
    			$MQ('l:image', {image: '../images/tree.jpg'});
    		}
    		else
    		{
    			$MQ('l:image', {image: '../images/sfgate.jpg'});
    		}
    		window.transition_count++;
    	}, 3000);
    </app:script>