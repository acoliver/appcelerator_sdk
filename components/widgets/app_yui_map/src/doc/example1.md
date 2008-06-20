Title: Simple Example

This is a simple example that uses the `<app:yui_map>` and populates the location of the Appcelerator HQ and the nearest bar.
	
    <app:yui_map id="mapContainer" api_key='Wcmd.ljV34Gz49YHhEFrjhaNgTer.SmTdtZYsVH97AMBd1PCp7FUL1y3wo8hSw-- '
        initial_location="Atlanta, GA" zoom_level="8" max_zoom_out="8" height="230px" width="358px"
        on_marker_click='r:portal.select.location.request'
        on="l:add.map.markers then add_markers"
    ></app:yui_map>
    
    <app:script>
        $MQ('l:add.map.markers, [{'id': 1, 'location': '3535 Piedmont Rd, Atlanta, Georgia 30305'}, 
            {'id': 2, 'location': '79 Buckhead Ave., Atlanta, GA 30305'}]);
    </app:script>