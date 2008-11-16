
Appcelerator.Widget.AppSimplePanel =
{
	/**
	 * The name of the widget
	 */
	getName: function()
	{
		return 'app:simple_panel';
	},
	/**
	 * A description of what the widget does
	 */
	getDescription: function()
	{
		return 'app:simple_panel, for when you just want rounded corners and don\'t care about the rest';
	},
	/**
	 * The version of the widget. This will automatically be corrected when you
	 * publish the widget.
	 */
	getVersion: function()
	{
		return "__VERSION__";
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
		return 'http://appcelerator.org';
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
		return 'app:simple_panel';
	},
	/**
	 * The attributes supported by the widget as attributes of the tag.  This metadata is 
	 * important so that your widget can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'color', optional: false, description: 'The color for the widget', type: T.enumeration('minty_fresh', 'new_grass')},
		    {name: 'user_class', optional: true, defaultValue: '', description: "additional classes"},
		    {name: 'height', optional: true, description: "height of the widget", type: T.cssDimension},
		    {name: 'width', optional: true, description: "width of the widget", type: T.cssDimension}];
	},
	
	/**
	 * return an array of condition names for the custom conditions the widget supports in
	 * the widget's on expression.
	 */
	getConditions: function()
	{
	    return [];
	},
	
	/**
	 * return an array of function names for the actions the widget supports in the widget's 
	 * on expression.
	 */
	getActions: function()
	{
		return [];
	},	
	/**
	 * this method will be called after the widget has been built, the content replaced and available
	 * in the DOM and when it is ready to be compiled.
	 *
	 * @param {object} parameters
	 */
	compileWidget: function(parameters)
	{
	    var element = $(parameters['id']);
	    
		if(parameters['width']) {element.style.width = parameters['width'];}
	    if(parameters['height']) {element.style.height =  parameters['height'];}
	    if(element.getStyle("width") == null || element.getStyle("width") == '0px') {element.style.width = "100%";}
	    if(element.getStyle("height") == null || element.getStyle("height") == '0px') {element.style.height = "100%";}
	    
        var interval = setInterval(function() {
            if(element.getHeight() > 0) {
                $(parameters['id'] + "_app_simple_panel_content").style.height = (element.getHeight() - 6) + "px";
                clearInterval(interval);
            }
        }, 150);
	},
	/**
	 * this method will be called each time a <app:simple_panel> is encountered in a page. the return object gives
	 * instructions to the compiler about how to process the widget.
	 *
	 * @param {element} dom element for the <app:simple_panel> encountered in the page
	 * @param {object} parameters object for the attributes that <app:simple_panel> supports
	 */
	buildWidget: function(element,parameters)
	{
	    var style = 'app_simple_panel_' + parameters['color'];
		var html = [];
		html.push('<div id="' + element.id + '" class="app_simple_panel ' + style + ' ' + parameters['user_class'] + '"');
		html.push('>');
        html.push('    <div class="app_simple_panel_top_left"></div><div class="app_simple_panel_top_right"></div><div class="app_simple_panel_center"></div>');
        html.push('    <div class="app_simple_panel_content" id="' + element.id + '_app_simple_panel_content">');
        html.push(Appcelerator.Compiler.getHtml(element));
        html.push('    </div>');
        html.push('    <div class="app_simple_panel_bottom_left"></div><div class="app_simple_panel_bottom_right"></div><div class="app_simple_panel_center"></div>');
        html.push('</div>');
		
		return {
			'presentation' : html.join(' '),   // this is the HTML to replace for the contents <app:simple_panel>
			'position' : Appcelerator.Compiler.POSITION_REPLACE,  // usually the default, could be POSITION_REMOVE to remove <app:simple_panel> entirely
			'wire' : true,  // true to compile the contents of the presentation contents replaced above
			'compile' : true,  // true to call compileWidget once the HTML has been replaced and available in the DOM
			'parameters': null  // parameters object to pass to compileWidget
		};		
	}
};

Appcelerator.Widget.loadWidgetCSS('app:simple_panel','simple_panel.css');
Appcelerator.Widget.register('app:simple_panel',Appcelerator.Widget.AppSimplePanel);



