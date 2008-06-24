Title: Using the FlexFlow

`app:as_flexflow` wraps Doug Mccune's coverflow widget: http://dougmccune.com/blog/2007/11/19/flex-coverflow-performance-improvement-flex-carousel-component-and-vertical-coverflow/

This is a simple example that uses the `<app:as_flexflow>`.
	
++example
<app:as_flexflow id="FlexFlowTest1" on="l:show.images.1 then execute or l:select then select" property="photos" 
        img_height="200" img_width="200" click_message="l:clicked">
</app:as_flexflow>
<app:script on="l:app.compiled then execute after 500">
    $MQ('l:show.images.1', {photos: [
        {'id': 1, 'label': 'Jeff', 'image': '../../widgets/app_as_flexflow/doc/jeff.jpg'},
        {'id': 2, 'label': 'Nolan', 'image': '../../widgets/app_as_flexflow/doc/nolan.jpg'},
        {'id': 3, 'label': 'Matt', 'image': '../../widgets/app_as_flexflow/doc/matt.jpg'},
        {'id': 4, 'label': 'Joe', 'image': '../../widgets/app_as_flexflow/doc/joe.jpg'}]});
</app:script>
--example

The property referenced by the 'property' attribute needs to be an array of objects. The widget will preserve any additional data passed in for subsequent click events.  

You can select a specific cover like-so:

++example 
<button on="click then l:select[id=2]">Select Nolan</button>
--example

Click on Jeff to see an alert:
++example 
<app:script on="l:clicked then execute">
    if(this.data.label == "Jeff")
    {
        alert("Thanks for using Appcelerator!");
    }
</app:script>
--example

*Note* this widget will not work if accessed via a file URL and must be accessed through a web server.  
*Note #2* this widget only works when there is one per page
