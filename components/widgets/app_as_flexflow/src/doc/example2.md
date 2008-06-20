Title: Selecting a specific cover

This is an example of how you would select a specific image in the coverflow.  This will select an element that had the ID '1':

    <app:as_flexflow id="FlexFlowTest" on="l:show.images then execute or l:select then select" property="photos" img_height="200" img_width="200"></app:as_flexflow>

    <app:message name="l:select" args="{'id': 1}"></app:message>

