
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */


/**
 * Yahoo Map widget wrapper
 * 
 * The syntax for the object that needs to be passed to a marker is:
 * {
 *     image: url, an optional image to be used for all markers,
 *     height: integer, if an image is specified, you must specify the height 
 *     width: integer, if an image is specified, you must specify the width 
 *     locations: an array of address strings, with an optional identifier:
 *            could either look like ['Atlanta', 'New York', 'Chicago', etc] or
 *            [{'id': 1, 'location': 'Atlanta'}, {'id': 2, 'location': 'Chicago'}, etc]
 */
Appcelerator.Widget.AppYuiMap =
{
    included: false,
    maps: [],
    getName: function()
    {
        return 'yahoo map';
    },
    getDescription: function()
    {
        return 'yahoo DHTML Map Widget';
    },
    getVersion: function()
    {
        return '__VERSION__';
    },
    getSpecVersion: function()
    {
        return 1.0;
    },
    getAuthor: function()
    {
        return 'Tejus Parikh';
    },
    getModuleURL: function ()
    {
        return 'http://www.appcelerator.org';
    },
    isWidget: function ()
    {
        return true;
    },
    getWidgetName: function()
    {
        return 'app:yui_map';
    },
    getActions: function()
    {
        return ['add_markers', 'clear_map', 'center_and_zoom', 'best_fit', 'select_location'];
    },  
    clear_map: function(id,parameters,data,scope,version)
    {
        var map = Appcelerator.Widget.AppYuiMap.maps[id];
        map.removeMarkersAll();
    },
    center_and_zoom: function(id, parameters, data, scope, version)
    {
        var map = Appcelerator.Widget.AppYuiMap.maps[id];
        var zoom = (data['zoom_level']) ? parseInt(data["zoom_level"]) : map.getZoomLevel();
        map.drawZoomAndCenter(data["location"], zoom);
    },
    best_fit: function(id, parameters, data, scope, version) 
    {
        var map = Appcelerator.Widget.AppYuiMap.maps[id];
        var points = [];
        var markers = map.getMarkerIDs();
        for(var i = 0, length = markers.length; i < length; i++) {
            var coordPoint = map.getMarkerObject(markers[i]).getCoordPoint();
            points.push(map.convertXYLatLon(coordPoint));
        }
        var ret = map.getBestZoomAndCenter(points);
        var max_zoom = parseInt(parameters["max_zoom_out"]);
        if(ret.zoomLevel > max_zoom) {
            var interval = setInterval(function() {
                ret = map.getBestZoomAndCenter(points);
                if(ret.zoomLevel < max_zoom) {
                    map.panToLatLon(ret.YGeoPoint);
                    map.setZoomLevel(ret.zoomLevel);
                    clearInterval(interval);
                }
            }, 500);
        } else {
            map.panToLatLon(ret.YGeoPoint);
            map.setZoomLevel(ret.zoomLevel);
        }
    },
    add_markers: function(id,parameters,data,scope,version)
    {
        var image = null, height = 33, width = 30;
        if(typeof data['image'] != "undefined") {
            image = data['image'];
            height = (typeof data['height' != "undefined"]) ? parseInt(data['height']) : height;
            width = (typeof data['width' != "undefined"]) ? parseInt(data['width']) : width;
        }
        
        var map = Appcelerator.Widget.AppYuiMap.maps[id];
        data['locations'].each(function(location) 
        {
            var marker;
            var myAddress = location, addrId = null;
            if(typeof location['id'] != "undefined") 
            {
                myAddress = location['location'];
                addrId = location['id'];
            }
            
            if(null != image) 
            {
                var myImage = new YImage();
                myImage.src = image;
                myImage.size = new YSize(width, height);
                myImage.offsetSmartWindow = new YCoordPoint(0,0);
                marker = new YMarker(myAddress, myImage);
            } else {
                marker = new YMarker(myAddress);
            }
            
            var clickMessage = (typeof parameters["on_marker_click"] != "undefined") ? parameters["on_marker_click"] : "l:" + id + "_clicked";
            YEvent.Capture(marker, EventsList.MouseClick, function() { $MQ(clickMessage, {'id': addrId, 'location': myAddress});    });
            map.addOverlay(marker);
        });
    },
    select_location: function(id,parameters,data,scope,version)
    {
        var image = null, height = 33, width = 30;
        if(typeof data['image'] != "undefined") {
            image = data['image'];
            height = (typeof data['height' != "undefined"]) ? parseInt(data['height']) : height;
            width = (typeof data['width' != "undefined"]) ? parseInt(data['width']) : width;
        }
        
        var map = Appcelerator.Widget.AppYuiMap.maps[id];
        var marker;
        var myAddress = data['location'];
        if(null != image) 
        {
            var myImage = new YImage();
            myImage.src = image;
            myImage.size = new YSize(width, height);
            myImage.offsetSmartWindow = new YCoordPoint(0,0);
            marker = new YMarker(myAddress, myImage, id + "_selected_marker");
        } else {
            marker = new YMarker(myAddress, id + "_selected_marker");
        }
        
        var selectedMarker = map.getMarkerObject( id + "_selected_marker");
        if(typeof selectedMarker != "undefined") 
        {
            map.removeMarker(selectedMarker);
        }
        
        map.addOverlay(marker);
        setTimeout( function() {
            $(id + "_selected_marker").style.zIndex = "1000";
        }, 150);
    },
    getAttributes: function()
    {
        return [ {
            name: 'api_key',
            optional: false,
            type: Appcelerator.Types.pattern(
                /^[a-zA-Z_][a-zA-Z0-9\-]*$/, 'Yahoo API'),
            description: "Your Yahoo API key"
        }, {
            name: 'on',
            optional: true,
            type:  Appcelerator.Types.onExpr,
            description: "May be used to call add marker"
        }, {
            name: 'on_marker_click',
            optional: true,
            type: Appcelerator.Types.messageSend,
            description: "Name of message sent when a marker is clicked, defaults to l:{id}_clicked"
        }, {
            name: 'height',
            optional: true,
            type: Appcelerator.Types.cssDimension,
            description: "Height of the map",
            defaultValue: "400px"
        }, {
            name: 'width',
            optional: true,
            type: Appcelerator.Types.cssDimension,
            description: "Width of the map",
            defaultValue: "400px"
        }, {
            name: "initial_location", 
            optional: true,
            description: "The initial location for the map",
            defaultValue: "USA"
        }, {
            name: "zoom_level", 
            optional: true,
            description: "the zoom level of the map",
            defaultValue: "15"
        }, {
            name: "max_zoom_out", 
            optional: true,
            description: "if you are trying to use best_fit and running into problems, try setting this to what you think is a reasonable value",
            defaultValue: "99"
        }, {
            name: "disable_key_controls",
            optional: true,
            description: "Disable default keyboard/mouse wheel zoom and pan controls shortcuts",
            defaultValue: true
        }
        ];
    },
    initializeMap: function(params) 
    {
        var mapDiv = $(params['id']);
        /* do this twice, seems to be important in both places */
        mapDiv.style.height = params['height'];
        mapDiv.style.width = params['width'];
        
        var map = new YMap(document.getElementById(params['id']));
        this.maps[params['id']] = map;
        map.removeZoomScale();
        map.setMapType(YAHOO_MAP_REG);
        map.addZoomShort();
        if(params['disable_key_controls']) {
            map.disableKeyControls();
        }
        
        mapDiv.style.height = params['height'];
        mapDiv.style.width = params['width'];
        
        map.drawZoomAndCenter(params["initial_location"], parseInt(params["zoom_level"]));
        $MQ('l:' + params['id'] + '_init');
    },
    compileWidget: function(params)
    {
        if(!this.included) {
            var yahooKey = params['api_key'];
            Appcelerator.Core.queueRemoteLoadScriptWithDependencies(
                "http://api.maps.yahoo.com/ajaxymap?v=3.8&appid=" + yahooKey, 
                function() { Appcelerator.Widget.AppYuiMap.initializeMap(params);}
            );  
            included = true;
        } else {
            Appcelerator.Widget.AppYuiMap.initializeMap(params);
        }

    },
    buildWidget: function(element,params)
    {
        var html = [];
        html.push("<div id='" + element.id + "'></div>");
        return {
            'presentation' : html.join(' '),
            'position' : Appcelerator.Compiler.POSITION_REPLACE,
            'wire' : true,
            'compile': true
        };
    }

};

Appcelerator.Widget.register('app:yui_map', Appcelerator.Widget.AppYuiMap);
