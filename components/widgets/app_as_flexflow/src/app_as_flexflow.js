
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
		return 1.0;
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
            name: 'click_message',
            optional: true,
			type: Appcelerator.Types.messageSend,
            description: "Then name of the message sent when the flex flow is clicked"
        }, {
            name: 'img_height',
            optional: true,
			type: Appcelerator.Types.naturalNumber,
			defaultValue: 300,
            description: "Then name of the message sent when the flex flow is clicked"
        }, {
             name: 'img_width',
            optional: true,
			type: Appcelerator.Types.naturalNumber,
			defaultValue: 300,
            description: "Then name of the message sent when the flex flow is clicked"
        }];
	},
	/**
	 * return an array of function names for the actions the widget supports in the widget's 
	 * on expression.
	 */
	getActions: function()
	{
		return ['execute'];
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
        	    $MQ(parameters['click_message'], {
                    'index': 0,
                    'image': Appcelerator.Widget.AppAsFlexflow.flows[id][0]["image"],
                    'label': Appcelerator.Widget.AppAsFlexflow.flows[id][0]["label"]
                });
        	    clearInterval(interval);
    	    }
    	    
        }, 500);
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
            bridge.getCfc().addEventListener("click", function() {
                var index = bridge.getCfc().getSelectedIndex();
                $MQ(parameters['click_message'], {
                    'index': index,
                    'image': Appcelerator.Widget.AppAsFlexflow.flows[id][index]["image"],
                    'label': Appcelerator.Widget.AppAsFlexflow.flows[id][index]["label"]
                });
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
	    
	    var box_height = parseInt(parameters['img_height']) + 100;
		var html = [];
		html.push('<div style="position:absolute; color:white;top:20px;text-align:center;width:100%" id="' + element.id + '_label" ');
		html.push('on="' + parameters['click_message'] + ' then hide and value[label] and effect[appear]"');
		html.push('></div>');
		html.push('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"');
        html.push('id="' + element.id + '" width="100%" height="' + box_height + '"');
        html.push('codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">');
        html.push('  <param name="movie" value="FlexFlow.swf" />');
        html.push('  <param name="flashvars" value="bridgeName=' + bridge_name + '"/>');
        html.push('  <param name="quality" value="high" />');
        html.push('  <param name="allowScriptAccess" value="sameDomain" />');
        html.push('  <embed src="' + Appcelerator.WidgetPath + 'app_as_flexflow/swf/FlexFlow.swf" quality="high"');
        html.push('    width="100%" height="' + box_height + '" name="' + bridge_name + '" ');
        html.push('    align="middle"');
        html.push('    play="true"');
        html.push('    loop="false"');
        html.push('    quality="high"');
        html.push('    allowScriptAccess="sameDomain"');
        html.push('    type="application/x-shockwave-flash"');
        html.push('    pluginspage="http://www.adobe.com/go/getflashplayer" ');
        html.push('    flashvars="bridgeName=' + bridge_name + '">');
        html.push('  </embed>');
        html.push('</object>');
		
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


