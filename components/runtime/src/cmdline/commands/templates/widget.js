
Appcelerator.Widget.WIDGET_CLASS_NAME =
{
	/**
	 * The name of the widget
	 */
	getName: function()
	{
		return 'NAME';
	},
	/**
	 * A description of what the widget does
	 */
	getDescription: function()
	{
		//TODO
		return 'NAME is the coolest widget in the world!';
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
		return '';
	},
	/**
	 * The URL for more information about the widget or the author.
	 */
	getModuleURL: function ()
	{
		//TODO
		return '';
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
		return 'NAME';
	},
	/**
	 * The attributes supported by the widget as attributes of the tag.  This metadata is 
	 * important so that your widget can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		
		/*
		Example: 
		return [{name: 'mode', optional: false, description: "Vertical or horizontal alignment",
		         type: T.enumeration('vertical', 'horizontal')}]
		*/
		
		//TODO
		return [];
	},
	/**
	 * return an array of function names for the actions the widget supports in the widget's 
	 * on expression.
	 */
	getActions: function()
	{
		/* 
		  TODO: you can define a widget action which can be called in the widget's on expression
		  by adding the name of the action here and then defining a function in this class with the 
		  same name. For example, for the action 'execute':
		
			 execute: function(id,params,data,scope)
			 {
			 }
			
		  You can then do something like:  
		  
		     <NAME on="l:some.message then execute"></NAME>
		  
		   and this method will be invoked on your widget.	
		*/
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
		//TODO: this method is only called if you set compiled=true in the return object of buildWidget
	},
	/**
	 * this method will be called each time a <NAME> is encountered in a page. the return object gives
	 * instructions to the compiler about how to process the widget.
	 *
	 * @param {element} dom element for the <NAME> encountered in the page
	 * @param {object} parameters object for the attributes that <NAME> supports
	 */
	buildWidget: function(element,parameters)
	{
		//TODO - this is optional, but usually is the HTML to replace for <NAME>
		var html = 'Hello from the <tt>&lt;NAME&gt;</tt> widget!';
		
		return {
			'presentation' : html,   // this is the HTML to replace for the contents <NAME>
			'position' : Appcelerator.Compiler.POSITION_REPLACE,  // usually the default, could be POSITION_REMOVE to remove <NAME> entirely
			'wire' : false,  // true to compile the contents of the presentation contents replaced above
			'compile' : false,  // true to call compileWidget once the HTML has been replaced and available in the DOM
			'parameters': null  // parameters object to pass to compileWidget
		};		
	}
};

/*
To load a custom widget CSS file - create a css file under the widget's css directory and 
reference it here. For example:
  
    Appcelerator.Core.loadModuleCSS('NAME','mystyles.css');

To load a widget that has widget JS dependencies, place your JS files under the widget's js
directory and use registerWidgetWithJS. For example:

    Appcelerator.Core.registerModuleWithJS('NAME',Appcelerator.Widget.WIDGET_CLASS_NAME,['a.js', 'b.js']);

You can require a common JS file (loaded under widgets/common/js) and load your widget once it's loaded.
For example:

	Appcelerator.Core.requireCommonJS('scriptaculous/builder.js',function()
	{
	    Appcelerator.Core.registerModuleWithJS('NAME',Appcelerator.Widget.WIDGET_CLASS_NAME,['a.js']);
	});

*/

Appcelerator.Core.registerModule('NAME',Appcelerator.Widget.WIDGET_CLASS_NAME);



