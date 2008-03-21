Title: Simple Example

This is a simple example that uses the `<app:yui_map>`.
	
	<app:yui_map id="mapContainer" api_key='your api key here'
        initial_location="Atlanta, GA" zoom_level="8" height="300px" width="400px"
        on_marker_click='r:select.location.request'
    ></app:yui_map>
    
This map will be 400px by 300px and show Atlanta, GA at a city zoom level.  
This widget requires that you have a Yahoo API key.  You can obtain one, 
using your Yahoo! account from: http://developer.yahoo.com/wsregapp/index.php.

Like other Appcelerator Widgets, the map responds to the web expression language.
The map has the following custom fuctions defined:
'add_markers', 'clear_map', 'center_and_zoom', 'best_fit', 'select_location'.

The syntax for the object that needs to be passed to a add_markers is:

     image: url, an optional image to be used for all markers,
     height: integer, if an image is specified, you must specify the height 
     width: integer, if an image is specified, you must specify the width	
     locations: an array of address strings, with an optional identifier:
            could either look like ['Atlanta', 'New York', 'Chicago', etc] or
            [{'id': 1, 'location': 'Atlanta'}, {'id': 2, 'location': 'Chicago'}, etc]
            
select_location, and center_and_zoom take a single location object instead of an array of locations.

'clear_map', 'best_fit' accept no parameters


	
