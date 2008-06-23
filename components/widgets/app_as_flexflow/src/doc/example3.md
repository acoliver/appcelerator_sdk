Title: Getting information about a Clicked Cover

The widget will spit back the object for a specific cover if you configure a click_message:

++example
<app:as_flexflow id="FlexFlowTest" on="l:show.images then execute" property="photos" click_message="l:clicked" img_height="200" img_width="200"></app:as_flexflow>
<app:message name="l:select" args="{'id': 1}"></app:message>
--example

