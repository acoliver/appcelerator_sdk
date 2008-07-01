Appcelerator.Widget.AppAsFlexflow =
{
    flows: {}, 
    
	/**
	 * The name of the widget
	 */
	getName: function()
	{
		return 'app:as_flexflow';
	},
	/**
	 * A description of what the widget does
	 */
	getDescription: function()
	{
		return 'app:as_flexflow uses the flex ajax bridge to show an iTunes like photo view';
	},
	/**
	 * The version of the widget. This will automatically be corrected when you
	 * publish the widget.
	 */
	getVersion: function()
	{
		return "1.0.4";
	},
	/**
	 * The widget spec version.  This is used to maintain backwards compatability as the
	 * Widget API needs to change.
	 */
	getSpecVersion: function()
	{
		return 1.0;
	},
	/**
	 * The widget author's full name (that's you)
	 */
	getAuthor: function()
	{
		//TODO
		return 'Tejus Parikh';
	},
	/**
	 * The URL for more information about the widget or the author.
	 */
	getModuleURL: function ()
	{
		//TODO
		return 'http://www.appcelerator.org';
	},
	/**
	 * This should always return true for widgets.
	 */
	isWidget: function ()
	{
		return true;
	},
	/**
	 * The widget's tag name
	 */
	getWidgetName: function()
	{
		return 'app:as_flexflow';
	},
	/**
	 * The attributes supported by the widget as attributes of the tag.  This metadata is 
	 * important so that your widget can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{
            name: 'on',
            optional: true,
			type: Appcelerator.Types.onExpr,
            description: "May be used to execute the script's content."
        }, {
            name: 'property',
            optional: false,
			type: T.identifier,
            description: "The name of the property in the passed in array that contains the list of photos"
        }, {
            name: 'view',
            optional: true,
            type: T.enumeration('vertical', 'vista', 'cover', 'carousel'),
            defaultValue: 'carousel',
            description: "The presentation view of the flex flow" 
        }, {
            name: 'click_message',
            optional: true,
			type: Appcelerator.Types.messageSend,
            description: "Then name of the message sent when the flex flow is clicked"
        }, {
            name: 'img_height',
            optional: true,
			type: Appcelerator.Types.naturalNumber,
			defaultValue: 300,
            description: "The height of the images in the flex flow"
        }, {
             name: 'img_width',
            optional: true,
			type: Appcelerator.Types.naturalNumber,
			defaultValue: 300,
            description: "The width of the images in the flex flow"
        }, {
            name: 'box_height',
            optional: true,
			type: Appcelerator.Types.naturalNumber,
			defaultValue: -1,
            description: "The height of the Flash box containing the flex flow"
        }, {
             name: 'box_width',
            optional: true,
			type: Appcelerator.Types.naturalNumber,
			defaultValue: "100%",
            description: "The width of the Flash box containing the flex flow"
        }, {
            name: 'label_position',
            optional: true,
            defaultValue: 'top',
            description: "Where the label goes"
        }];
	},
	/**
	 * return an array of function names for the actions the widget supports in the widget's 
	 * on expression.
	 */
	getActions: function()
	{
		return ['execute', 'select'];
	},
	execute: function(id,parameters,data,scope,version)
	{
        var bridge_name = id + "_bridge";
        var photos = data[parameters["property"]];
        Appcelerator.Widget.AppAsFlexflow.flows[id] = photos;
        var images = [];
        for(var i = 0, length = photos.length; i < length; i++) 
        {
            images.push(photos[i]["image"]);
        }
        
	    var interval = setInterval( function()
	    {
	        if(typeof FABridge[bridge_name] != "undefined") {
        	    var bridge = FABridge[bridge_name].root();
        	    bridge.setDataProvider(images);
                var data = Appcelerator.Widget.AppAsFlexflow.flows[id][0];
                data.index = 0;
                
				$(id + "_label").innerHTML = data.label;
        	    clearInterval(interval);
    	    }
    	    
        }, 500);
	},	
	select: function(id,parameters,data,scope,version)
	{
	    var bridge_name = id + "_bridge";
	    var bridge = FABridge[bridge_name].root();
	    
	    var covers = Appcelerator.Widget.AppAsFlexflow.flows[id];
	    for(var i = 0, length = covers.length; i < length; i++) 
	    {
	        var selected = -1;
	        if(data['id'] == covers[i].id || data['image'] == covers[i].image || data['label'] == covers[i].label) 
	        {
	            selected = i;
	        } 
	        
	        if(selected != -1) {
	            bridge.getFlowWidget().setSelectedIndex(i);
	            var data = covers[i];
                data.index = i;
                $MQ(id + "_select", data);
	            break;
	        }
	    }
	},
	/**
	 * this method will be called after the widget has been built, the content replaced and available
	 * in the DOM and when it is ready to be compiled.
	 *
	 * @param {object} parameters
	 */
	compileWidget: function(parameters)
	{
	    var id = parameters['id'];
	    var bridge_name = id + "_bridge";
		FABridge.addInitializationCallback(bridge_name, function() {
            var bridge = FABridge[bridge_name].root();
            bridge.setReflectionEnable(true);
            bridge.setBgColor(0x000000);
            bridge.setMaxImageWidth(parameters['img_width']);
            bridge.setMaxImageHeight(parameters['img_height']); 
            bridge.getFlowWidget().addEventListener("click", function() {
                var index = bridge.getFlowWidget().getSelectedIndex();
                var data = Appcelerator.Widget.AppAsFlexflow.flows[id][index];
                data.index = index;
				$(id + "_label").innerHTML = data.label;
                setTimeout( function() {
					$MQ(parameters['click_message'], data);
				}, 1100);
            }); 
        });
	},
	/**
	 * this method will be called each time a <app:as_flexflow> is encountered in a page. the return object gives
	 * instructions to the compiler about how to process the widget.
	 *
	 * @param {element} dom element for the <app:as_flexflow> encountered in the page
	 * @param {object} parameters object for the attributes that <app:as_flexflow> supports
	 */
	buildWidget: function(element,parameters)
	{
	    var id = element.id;
	    var bridge_name = element.id + "_bridge";
	    if(typeof parameters['click_message'] == "undefined") {
	        parameters['click_message'] = "l:" + id + "_click";
	    }
	    
	    var view = parameters['view'];

	    var box_height = parameters['box_height'];
	    if(box_height == -1 && view == 'vertical') {
	        box_height = parseInt(parameters['img_height']) * 2;
	    } else if (box_height == -1) {    
	        box_height = parseInt(parameters['img_height']) + 100;
	    }

	    var box_width = parameters['box_width'];
	    
		var html = [];
		html.push('<div style="position:relative; background-color: black;" id="' + id + '">');
		
		if("top" == parameters['label_position']) {    
    		html.push('<div style="background-color: black; color:white;padding-top:7px; position:absolute; top: -11px; text-align:center;width:100%"><span id="' + element.id + '_label" ');
    		html.push('on="' + parameters['click_message'] + ' then hide and value[label] and show if expr[this.data.label] or l:' 
    		        + element.id + '_select then hide and value[label] and show"');
    		html.push('></span></div>');
		}
		
		html.push('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"');
        html.push('id="flow_object_' + element.id + '" width="' + box_width + '" height="' + box_height + '"');
        html.push('codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">');
        html.push('  <param name="movie" value="' + Appcelerator.WidgetPath + 'app_as_flexflow/swf/FlexFlow.swf" />');
        html.push('  <param name="flashvars" value="bridgeName=' + bridge_name + '&flowName=' + view + '"/>');
        html.push('  <param name="quality" value="high" />');
        html.push('  <param name="allowScriptAccess" value="sameDomain" />');
        html.push('  <param name="wmode" value="transparent" />');
        html.push('  <embed src="' + Appcelerator.WidgetPath + 'app_as_flexflow/swf/FlexFlow.swf" quality="high"');
        html.push('    width="' + box_width + '" height="' + box_height + '" name="' + bridge_name + '" ');
        html.push('    align="middle"');
        html.push('    play="true"');
        html.push('    wmode="transparent"');
        html.push('    loop="false"');
        html.push('    quality="high"');
        html.push('    allowScriptAccess="sameDomain"');
        html.push('    type="application/x-shockwave-flash"');
        html.push('    pluginspage="http://www.adobe.com/go/getflashplayer" ');
        html.push('    flashvars="bridgeName=' + bridge_name + '&flowName=' + view + '">');
        html.push('  </embed>');
        html.push('</object>');
        
        if("bottom" == parameters['label_position']) {    
    		html.push('<div style="color:white;position:relative;bottom:56px;text-align:center;width:100%"><span id="' + element.id + '_label" ');
    		html.push('on="' + parameters['click_message'] + ' then hide and value[label] and show if expr[this.data.label] or l:' 
    		        + element.id + '_select then hide and value[label] and show"');
    		html.push('></span></div>');
		}
		
		
        html.push('</div>');
		return {
			'presentation' : html.join(' '),   // this is the HTML to replace for the contents <app:as_flexflow>
			'position' : Appcelerator.Compiler.POSITION_REPLACE,  // usually the default, could be POSITION_REMOVE to remove <app:as_flexflow> entirely
			'wire' : true,  // true to compile the contents of the presentation contents replaced above
			'compile' : true,  // true to call compileWidget once the HTML has been replaced and available in the DOM
			'parameters': parameters  // parameters object to pass to compileWidget
		};		
	}
};

/*
To load a custom widget CSS file - create a css file under the widget's css directory and 
reference it here. For example:
  
    Appcelerator.Widget.loadWidgetCSS('app:as_flexflow','mystyles.css');

To load a widget that has widget JS dependencies, place your JS files under the widget's js
directory and use registerWidgetWithJS. For example:

    Appcelerator.Widget.registerWidgetWithJS('app:as_flexflow',Appcelerator.Widget.AppAsFlexflow,['a.js', 'b.js']);

You can require a common JS file (loaded under widgets/common/js) and load your widget once it's loaded.
For example:

	Appcelerator.Widget.requireCommonJS('scriptaculous/builder.js',function()
	{
	    Appcelerator.Widget.registerWidgetWithJS('app:as_flexflow',Appcelerator.Widget.AppAsFlexflow,['a.js']);
	});

*/
// Appcelerator.Widget.register('app:as_flexflow',Appcelerator.Widget.AppAsFlexflow);
Appcelerator.Widget.registerWidgetWithJS('app:as_flexflow',Appcelerator.Widget.AppAsFlexflow,['AC_OETags.js', 'FABridge.js']);



