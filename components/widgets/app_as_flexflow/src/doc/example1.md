Title: Using the FlexFlow

`app:as_flexflow` wraps Doug Mccune's coverflow widget: http://dougmccune.com/blog/2007/11/19/flex-coverflow-performance-improvement-flex-carousel-component-and-vertical-coverflow/

This is a simple example that uses the `<app:as_flexflow>`.
	
	<app:as_flexflow id="FlexFlowTest" on="l:show.images then execute" property="photos" img_height="200" img_width="200"></app:as_flexflow>
	
The property referenced by the 'property' attribute needs to be an array of objects like:
[
    {'label': 'Engine', 'image': 'images/P1230065.JPG'},
    {'label': 'Mountains', 'image': 'images/P1240078.JPG'},
    {'label': 'Clock Tower', 'image': 'images/P1260094.JPG'},
    {'label': 'Plaza', 'image': 'images/P1260095.JPG'},
    {'label': 'Steet', 'image': 'images/P1260097.JPG'}
]
The widget will preserve any additional data passed in for subsequent click events. 
	
*Note* this widget will not work if accessed via a file URL and must be accessed through a web server.  
