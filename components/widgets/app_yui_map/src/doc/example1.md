Title: Simple Example

This is a simple example that uses the `<app:yui_map>` and populates the location of the Appcelerator HQ and the nearest bar.

++example	
<app:yui_map id="mapContainer" api_key='Wcmd.ljV34Gz49YHhEFrjhaNgTer.SmTdtZYsVH97AMBd1PCp7FUL1y3wo8hSw--'
    initial_location="79 Buckhead Ave., Atlanta, GA 30305" zoom_level="5" max_zoom_out="8" height="230px" width="625px"
    on_marker_click='r:portal.select.location.request'
    on="l:add.map.markers then add_markers"
></app:yui_map>

<app:script  on="l:mapContainer_init then execute">
    $MQ('l:add.map.markers', {'locations': [{'id': 1, 'location': '3535 Piedmont Rd, Atlanta, Georgia 30305'}, 
        {'id': 2, 'location': '79 Buckhead Ave., Atlanta, GA 30305'}]});
</app:script>
--example

Since `<app:yui_map>` requires a lot of additional, external javascript to load before being functional, it's best to wait
until <span class="codeword">l:&lt;element_id&gt;_init</span> before calling any actions on the map.